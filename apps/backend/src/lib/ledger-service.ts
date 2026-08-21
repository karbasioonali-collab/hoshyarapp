// سرویس مرکزی حسابداری هوشیار.
//
// این تنها نقطه‌ی ورودیه که مجازه موجودی بانک، وضعیت اقساط، و وضعیت بدهی/طلب رو تغییر بده -
// چه از مسیر دستی، چه از ویس، چه خودکار (مثل تولید اقساط ماهانه). هر عملیات:
//   ۱) داخل یک prisma.$transaction اتمیک اجرا می‌شه (یا کامل انجام می‌شه یا هیچی).
//   ۲) یک یا چند LedgerEvent با جمله‌ی فارسی‌ی ساده برمی‌گردونه که مستقیم به کاربر نشون داده می‌شه.
import { Prisma, PrismaClient } from "@hoshyar/database";
import {
  addJalaliMonths,
  formatTomanPhrase,
  parseJalaliDateString,
  toGregorian,
  todayJalali,
} from "@hoshyar/shared";
import { prisma } from "./db";
import { ApiError } from "./api-helpers";

type Tx = Prisma.TransactionClient | PrismaClient;

export interface LedgerEventDraft {
  message: string;
  transactionId?: string | null;
}

async function persistEvents(tx: Tx, userId: string, events: LedgerEventDraft[]) {
  if (events.length === 0) return [];
  await tx.ledgerEvent.createMany({
    data: events.map((event) => ({
      userId,
      message: event.message,
      transactionId: event.transactionId ?? null,
    })),
  });
  return events;
}

/** موجودی حساب بانکی رو با یک مقدار امضادار تغییر می‌ده و جمله‌ی فارسی‌ی توضیح رو برمی‌گردونه */
async function applyBankDelta(
  tx: Tx,
  bankAccountId: string,
  userId: string,
  signedAmount: number,
): Promise<LedgerEventDraft> {
  const account = await tx.bankAccount.findFirst({ where: { id: bankAccountId, userId } });
  if (!account) {
    throw new ApiError("حساب بانکی پیدا نشد", 404);
  }
  await tx.bankAccount.update({
    where: { id: bankAccountId },
    data: { balance: { increment: signedAmount } },
  });
  const phrase = formatTomanPhrase(Math.abs(signedAmount));
  const verb = signedAmount >= 0 ? "به" : "از";
  const suffix = signedAmount >= 0 ? "اضافه شد" : "کم شد";
  return { message: `${phrase} ${verb} حساب ${account.name} ${suffix}` };
}

function branchSign(branch: string): 1 | -1 {
  return branch === "INCOME" ? 1 : -1;
}

// ---------- تراکنش‌های عمومی (درآمد / هزینه) ----------

export interface RecordTransactionInput {
  categoryId: string;
  bankAccountId?: string | null;
  amount: number;
  occurredOnJalali: string;
  description?: string;
  status?: "PAID" | "PENDING";
  source?: "MANUAL" | "VOICE" | "AUTO";
  metadata?: Record<string, unknown>;
}

export async function recordTransaction(userId: string, input: RecordTransactionInput) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.findFirst({
      where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) {
      throw new ApiError("دسته‌بندی پیدا نشد", 404);
    }
    const { jy, jm, jd } = parseJalaliDateString(input.occurredOnJalali);
    const status = input.status ?? "PAID";

    const transaction = await tx.transaction.create({
      data: {
        userId,
        categoryId: input.categoryId,
        bankAccountId: input.bankAccountId ?? null,
        amount: input.amount,
        occurredOn: toGregorian(jy, jm, jd),
        description: input.description,
        status,
        source: input.source ?? "MANUAL",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    const events: LedgerEventDraft[] = [];
    if (status === "PAID" && input.bankAccountId) {
      const signedAmount = branchSign(category.branch) * Number(input.amount);
      const bankEvent = await applyBankDelta(tx, input.bankAccountId, userId, signedAmount);
      events.push({ ...bankEvent, transactionId: transaction.id });
    }
    await persistEvents(tx, userId, events);
    return { transaction, events };
  });
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: Partial<RecordTransactionInput>,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id: transactionId, userId },
      include: { category: true },
    });
    if (!existing) {
      throw new ApiError("تراکنش پیدا نشد", 404);
    }

    const events: LedgerEventDraft[] = [];
    // برگردوندن اثر قبلی روی بانک
    if (existing.status === "PAID" && existing.bankAccountId) {
      const reverseAmount = -branchSign(existing.category.branch) * Number(existing.amount);
      events.push(await applyBankDelta(tx, existing.bankAccountId, userId, reverseAmount));
    }

    const nextCategoryId = input.categoryId ?? existing.categoryId;
    const nextCategory =
      input.categoryId && input.categoryId !== existing.categoryId
        ? await tx.category.findFirst({ where: { id: nextCategoryId, OR: [{ userId }, { userId: null }] } })
        : existing.category;
    if (!nextCategory) {
      throw new ApiError("دسته‌بندی پیدا نشد", 404);
    }

    const nextAmount = input.amount ?? Number(existing.amount);
    const nextBankAccountId =
      input.bankAccountId !== undefined ? input.bankAccountId : existing.bankAccountId;
    const nextStatus = input.status ?? existing.status;
    const nextOccurredOn = input.occurredOnJalali
      ? (() => {
          const { jy, jm, jd } = parseJalaliDateString(input.occurredOnJalali!);
          return toGregorian(jy, jm, jd);
        })()
      : existing.occurredOn;

    const transaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId: nextCategoryId,
        bankAccountId: nextBankAccountId,
        amount: nextAmount,
        occurredOn: nextOccurredOn,
        description: input.description ?? existing.description,
        status: nextStatus,
        metadata: (input.metadata ?? (existing.metadata as Record<string, unknown>)) as Prisma.InputJsonValue,
      },
    });

    if (nextStatus === "PAID" && nextBankAccountId) {
      const applyAmount = branchSign(nextCategory.branch) * Number(nextAmount);
      events.push(await applyBankDelta(tx, nextBankAccountId, userId, applyAmount));
    }

    await persistEvents(
      tx,
      userId,
      events.map((event) => ({ ...event, transactionId: transaction.id })),
    );
    return { transaction, events };
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id: transactionId, userId },
      include: { category: true },
    });
    if (!existing) {
      throw new ApiError("تراکنش پیدا نشد", 404);
    }
    const events: LedgerEventDraft[] = [];
    if (existing.status === "PAID" && existing.bankAccountId) {
      const reverseAmount = -branchSign(existing.category.branch) * Number(existing.amount);
      events.push(await applyBankDelta(tx, existing.bankAccountId, userId, reverseAmount));
    }
    await tx.transaction.delete({ where: { id: transactionId } });
    await persistEvents(tx, userId, events);
    return { events };
  });
}

// ---------- اقساط ----------

export interface CreateInstallmentPlanInput {
  description: string;
  totalAmount: number;
  monthsCount: number;
  payDay: number;
  bankAccountId?: string | null;
}

export async function createInstallmentPlan(userId: string, input: CreateInstallmentPlanInput) {
  return prisma.$transaction(async (tx) => {
    const monthlyAmount = Math.round((input.totalAmount / input.monthsCount) * 100) / 100;
    const plan = await tx.installmentPlan.create({
      data: {
        userId,
        description: input.description,
        totalAmount: input.totalAmount,
        monthlyAmount,
        monthsCount: input.monthsCount,
        payDay: input.payDay,
        bankAccountId: input.bankAccountId ?? null,
      },
    });

    const today = todayJalali();
    // اولین قسط: اگه روز پرداخت این ماه هنوز نگذشته همین ماه، وگرنه ماه بعد
    const firstMonthOffset = today.jd <= input.payDay ? 0 : 1;
    const payments = Array.from({ length: input.monthsCount }, (_, index) => {
      const due = addJalaliMonths(today.jy, today.jm, input.payDay, firstMonthOffset + index);
      return {
        planId: plan.id,
        monthIndex: index + 1,
        dueJalaliYear: due.jy,
        dueMonth: due.jm,
        dueDay: due.jd,
        amount: monthlyAmount,
      };
    });
    await tx.installmentPayment.createMany({ data: payments });

    const events: LedgerEventDraft[] = [
      {
        message: `قسط «${input.description}» به مبلغ ${formatTomanPhrase(monthlyAmount)} در ماه، برای ${input.monthsCount} ماه ثبت شد`,
      },
    ];
    await persistEvents(tx, userId, events);
    return { plan, events };
  });
}

export async function payInstallmentPayment(userId: string, paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.installmentPayment.findFirst({
      where: { id: paymentId, plan: { userId } },
      include: { plan: true },
    });
    if (!payment) {
      throw new ApiError("قسط پیدا نشد", 404);
    }
    if (payment.paidAt) {
      throw new ApiError("این قسط قبلاً پرداخت شده", 409);
    }

    const events: LedgerEventDraft[] = [];
    if (payment.plan.bankAccountId) {
      events.push(
        await applyBankDelta(tx, payment.plan.bankAccountId, userId, -Number(payment.amount)),
      );
    }
    await tx.installmentPayment.update({ where: { id: paymentId }, data: { paidAt: new Date() } });
    events.push({ message: `قسط «${payment.plan.description}» پرداخت‌شده علامت خورد` });

    await persistEvents(tx, userId, events);
    return { events };
  });
}

// ---------- بدهی/طلب اشخاص ----------

export async function settlePersonEntry(userId: string, entryId: string) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.personLedgerEntry.findFirst({ where: { id: entryId, userId } });
    if (!entry) {
      throw new ApiError("مورد پیدا نشد", 404);
    }
    if (entry.status === "SETTLED") {
      throw new ApiError("قبلاً تسویه شده", 409);
    }

    const events: LedgerEventDraft[] = [];
    if (entry.bankAccountId) {
      const signedAmount = (entry.direction === "RECEIVABLE" ? 1 : -1) * Number(entry.amount);
      events.push(await applyBankDelta(tx, entry.bankAccountId, userId, signedAmount));
    }
    await tx.personLedgerEntry.update({
      where: { id: entryId },
      data: { status: "SETTLED", settledAt: new Date() },
    });
    const verb = entry.direction === "RECEIVABLE" ? "دریافت شد" : "پرداخت شد";
    events.push({ message: `طلب/بدهی «${entry.description}» از ${entry.personName} ${verb}` });

    await persistEvents(tx, userId, events);
    return { events };
  });
}
