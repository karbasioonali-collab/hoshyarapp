import { NextRequest, NextResponse } from "next/server";
import { reminderInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, reminderInputSchema.partial());
  const existing = await prisma.reminder.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("یادآوری پیدا نشد", 404);
  }
  const reminder = await prisma.reminder.update({ where: { id: params.id }, data: input });
  return NextResponse.json({ reminder });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.reminder.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("یادآوری پیدا نشد", 404);
  }
  await prisma.reminder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
