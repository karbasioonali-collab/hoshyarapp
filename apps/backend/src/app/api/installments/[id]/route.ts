import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const plan = await prisma.installmentPlan.findFirst({
    where: { id: params.id, userId },
    include: { payments: { orderBy: { monthIndex: "asc" } }, bankAccount: true },
  });
  if (!plan) {
    throw new ApiError("قسط پیدا نشد", 404);
  }
  return NextResponse.json({ plan });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.installmentPlan.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("قسط پیدا نشد", 404);
  }
  await prisma.installmentPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
