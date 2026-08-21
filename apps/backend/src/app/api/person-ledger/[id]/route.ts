import { NextRequest, NextResponse } from "next/server";
import { personLedgerEntryInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, personLedgerEntryInputSchema.partial());
  const existing = await prisma.personLedgerEntry.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("مورد پیدا نشد", 404);
  }
  const entry = await prisma.personLedgerEntry.update({ where: { id: params.id }, data: input });
  return NextResponse.json({ entry });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.personLedgerEntry.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("مورد پیدا نشد", 404);
  }
  await prisma.personLedgerEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
