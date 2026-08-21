import { NextRequest, NextResponse } from "next/server";
import { bankAccountInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, bankAccountInputSchema.partial());
  const existing = await prisma.bankAccount.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("حساب بانکی پیدا نشد", 404);
  }
  const account = await prisma.bankAccount.update({
    where: { id: params.id },
    data: {
      name: input.name,
      description: input.description,
      ...(input.balance !== undefined ? { balance: input.balance } : {}),
    },
  });
  return NextResponse.json({ account });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.bankAccount.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("حساب بانکی پیدا نشد", 404);
  }
  await prisma.bankAccount.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
