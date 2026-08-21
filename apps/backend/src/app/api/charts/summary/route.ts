import { NextRequest, NextResponse } from "next/server";
import { toGregorian, todayJalali } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { requireUserId, withErrorHandling } from "@/lib/api-helpers";

// نمودار خلاصه‌ی کلی صفحه‌ی «حساب و کتاب»: مقایسه‌ی ۶ سرشاخه برای ماه جاری
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { jy, jm } = todayJalali();
  const monthStart = toGregorian(jy, jm, 1);
  const nextMonth = jm === 12 ? { jy: jy + 1, jm: 1 } : { jy, jm: jm + 1 };
  const monthEnd = toGregorian(nextMonth.jy, nextMonth.jm, 1);

  const [incomeSum, expenseSum, installmentSum, debtSum, receivableSum, assets] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        status: "PAID",
        occurredOn: { gte: monthStart, lt: monthEnd },
        category: { branch: "INCOME" },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        status: "PAID",
        occurredOn: { gte: monthStart, lt: monthEnd },
        category: { branch: "EXPENSE" },
      },
      _sum: { amount: true },
    }),
    prisma.installmentPayment.aggregate({
      where: { plan: { userId }, dueJalaliYear: jy, dueMonth: jm },
      _sum: { amount: true },
    }),
    prisma.personLedgerEntry.aggregate({
      where: { userId, direction: "DEBT", status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.personLedgerEntry.aggregate({
      where: { userId, direction: "RECEIVABLE", status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.asset.findMany({ where: { userId, unit: { contains: "تومان" } } }),
  ]);

  const assetSum = assets.reduce((total, asset) => total + (Number(asset.amount) || 0), 0);

  return NextResponse.json({
    jalaliMonth: { jy, jm },
    branches: {
      INCOME: Number(incomeSum._sum.amount ?? 0),
      EXPENSE: Number(expenseSum._sum.amount ?? 0),
      INSTALLMENT: Number(installmentSum._sum.amount ?? 0),
      DEBT: Number(debtSum._sum.amount ?? 0),
      RECEIVABLE: Number(receivableSum._sum.amount ?? 0),
      ASSET: assetSum,
    },
  });
});
