// این ماژول قلب ورودی هوش مصنوعی هوشیاره: متن (از ویس یا تایپ) رو می‌گیره، از LLM
// می‌خواد یکی از اقدام‌های شناخته‌شده رو تشخیص بده، و اگه لازم بود مستقیم از طریق
// ledger-service اجراش می‌کنه - نه اینکه فقط راهنمایی بده.
import {
  AiIntentOutput,
  aiIntentOutputSchema,
  BRANCH_LABELS,
  todayJalali,
  VoiceIntentRequest,
  VoiceIntentResponse,
} from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { getAiProvider } from "@/lib/ai";
import {
  createInstallmentPlan,
  payInstallmentPayment,
  recordTransaction,
} from "@hoshyar/database";

async function buildContext(userId: string) {
  const [bankAccounts, categories, plans] = await Promise.all([
    prisma.bankAccount.findMany({ where: { userId }, select: { id: true, name: true } }),
    prisma.category.findMany({
      where: { branch: { in: ["INCOME", "EXPENSE"] }, OR: [{ userId }, { userId: null }] },
      select: { id: true, name: true, branch: true, parentId: true },
    }),
    prisma.installmentPlan.findMany({
      where: { userId, payments: { some: { paidAt: null } } },
      select: { id: true, description: true },
    }),
  ]);
  return { bankAccounts, categories, plans };
}

type Context = Awaited<ReturnType<typeof buildContext>>;

function buildSystemPrompt(context: Context): string {
  const categoryList = context.categories
    .map((c) => `- (${BRANCH_LABELS[c.branch]}) ${c.name}${c.parentId ? " [زیرشاخه]" : ""}`)
    .join("\n");
  const accountList = context.bankAccounts.map((a) => `- ${a.name}`).join("\n") || "(هنوز حسابی ثبت نشده)";

  return `تو دستیار مالی فارسی «هوشیار» هستی. کاربر با ویس یا تایپ چیزی می‌گه و تو باید دقیقاً یک
خروجی JSON با این ساختار برگردونی، بدون هیچ توضیح اضافه:
{"message": "یک جمله‌ی فارسی ساده برای کاربر", "action": {...}}

action.type باید یکی از این‌ها باشه:
- add_transaction: {type, branch(INCOME|EXPENSE), categoryName, amount(عدد تومان), bankAccountName?, description?, occurredOnJalali?(YYYY-MM-DD)}
- pay_installment: {type, installmentDescription}
- create_installment: {type, description, totalAmount, monthsCount, payDay(1-31), bankAccountName?}
- navigate: {type, path}
- ask_clarification: {type, question} — وقتی چیزی معلوم نیست (مثلاً کدوم حساب بانکی)

دسته‌بندی‌های موجود:
${categoryList}

حساب‌های بانکی کاربر:
${accountList}

اگه دسته‌بندی یا حساب بانکی مطمئن نیستی، از ask_clarification استفاده کن. فقط JSON خروجی بده.`;
}

function resolveNavigatePath(branch?: string, categoryId?: string) {
  return { branch, categoryId };
}

export async function runVoiceIntent(
  userId: string,
  request: VoiceIntentRequest,
): Promise<VoiceIntentResponse> {
  const context = await buildContext(userId);
  const provider = getAiProvider();

  const raw = await provider.chatComplete(
    [
      { role: "system", content: buildSystemPrompt(context) },
      { role: "user", content: request.text },
    ],
    { jsonMode: true },
  );

  let parsed: AiIntentOutput;
  try {
    parsed = aiIntentOutputSchema.parse(JSON.parse(raw.content));
  } catch {
    parsed = {
      message: "متوجه نشدم، می‌شه واضح‌تر بگید؟",
      action: { type: "ask_clarification", question: "دقیقاً چی می‌خواستید ثبت کنید؟" },
    };
  }

  const response: VoiceIntentResponse = { message: parsed.message, action: parsed.action };

  if (parsed.action.type === "add_transaction") {
    const action = parsed.action;
    const category = context.categories.find(
      (c) => c.branch === action.branch && c.name.includes(action.categoryName),
    );
    if (!category) {
      response.action = {
        type: "ask_clarification",
        question: `دسته‌بندی «${action.categoryName}» رو پیدا نکردم، دقیق‌تر بگید کجا ثبت بشه؟`,
      };
      response.message = response.action.question;
      await logInteraction(userId, request, parsed.action, response);
      return response;
    }

    let bankAccountId: string | null = null;
    if (action.bankAccountName) {
      const bankAccountName = action.bankAccountName;
      const match = context.bankAccounts.find((a) => a.name.includes(bankAccountName));
      if (!match) {
        response.action = {
          type: "ask_clarification",
          question: `حساب بانکی «${action.bankAccountName}» رو پیدا نکردم، کدوم حساب؟`,
        };
        response.message = response.action.question;
        await logInteraction(userId, request, parsed.action, response);
        return response;
      }
      bankAccountId = match.id;
    } else if (context.bankAccounts.length === 1) {
      bankAccountId = context.bankAccounts[0].id;
    } else if (context.bankAccounts.length > 1) {
      response.action = { type: "ask_clarification", question: "این مبلغ از کدوم حساب بانکی کم/اضافه بشه؟" };
      response.message = response.action.question;
      await logInteraction(userId, request, parsed.action, response);
      return response;
    }

    const { events } = await recordTransaction(userId, {
      categoryId: category.id,
      bankAccountId,
      amount: action.amount,
      occurredOnJalali: action.occurredOnJalali ?? todayAsJalaliString(),
      description: action.description,
      source: request.inputType === "VOICE" ? "VOICE" : "MANUAL",
    });
    response.ledgerMessages = events.map((e) => e.message);
    response.navigateTo = resolveNavigatePath(category.branch, category.id);
  } else if (parsed.action.type === "pay_installment") {
    const action = parsed.action;
    const plan = context.plans.find((p) => p.description.includes(action.installmentDescription));
    if (!plan) {
      response.action = {
        type: "ask_clarification",
        question: `قسط «${action.installmentDescription}» رو پیدا نکردم.`,
      };
      response.message = response.action.question;
    } else {
      const nextPayment = await prisma.installmentPayment.findFirst({
        where: { planId: plan.id, paidAt: null },
        orderBy: { monthIndex: "asc" },
      });
      if (!nextPayment) {
        response.message = `همه‌ی قسط‌های «${plan.description}» قبلاً پرداخت شده`;
      } else {
        const { events } = await payInstallmentPayment(userId, nextPayment.id);
        response.ledgerMessages = events.map((e) => e.message);
      }
    }
  } else if (parsed.action.type === "create_installment") {
    const action = parsed.action;
    let bankAccountId: string | null = null;
    if (action.bankAccountName) {
      const bankAccountName = action.bankAccountName;
      bankAccountId = context.bankAccounts.find((a) => a.name.includes(bankAccountName))?.id ?? null;
    } else if (context.bankAccounts.length === 1) {
      bankAccountId = context.bankAccounts[0].id;
    }
    const { events } = await createInstallmentPlan(userId, {
      description: action.description,
      totalAmount: action.totalAmount,
      monthsCount: action.monthsCount,
      payDay: action.payDay,
      bankAccountId,
    });
    response.ledgerMessages = events.map((e) => e.message);
  }

  if (request.wantsAudio) {
    try {
      const speech = await provider.synthesizeSpeech(response.message);
      if (speech.audioBase64) response.audioBase64 = speech.audioBase64;
    } catch {
      // اگه TTS شکست خورد، متن همچنان در دسترسه (اصل fallback)
    }
  }

  await logInteraction(userId, request, parsed.action, response);
  return response;
}

function todayAsJalaliString(): string {
  const { jy, jm, jd } = todayJalali();
  return `${jy}-${jm}-${jd}`;
}

async function logInteraction(
  userId: string,
  request: VoiceIntentRequest,
  intent: unknown,
  response: VoiceIntentResponse,
) {
  await prisma.voiceInteraction.create({
    data: {
      userId,
      inputType: request.inputType,
      rawText: request.text,
      intent: intent as object,
      actionTaken: response as unknown as object,
      pageContext: request.pageContext,
    },
  });
}
