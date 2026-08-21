import { NextRequest, NextResponse } from "next/server";
import { installmentPlanInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { createInstallmentPlan } from "@/lib/ledger-service";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const plans = await prisma.installmentPlan.findMany({
    where: { userId },
    include: { payments: { orderBy: { monthIndex: "asc" } }, bankAccount: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plans });
});

// وقتی کاربر می‌گه «قسط ۲ تومن، ۱۳ ماهه، روز ۲۳»، این خودکار به تعداد monthsCount رکورد ماهانه می‌سازه
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, installmentPlanInputSchema);
  const { plan, events } = await createInstallmentPlan(userId, input);
  return NextResponse.json({ plan, events }, { status: 201 });
});
