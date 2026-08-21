import { NextRequest, NextResponse } from "next/server";
import { eventInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, eventInputSchema.partial());
  const existing = await prisma.event.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("مناسبت پیدا نشد", 404);
  }
  const event = await prisma.event.update({ where: { id: params.id }, data: input });
  return NextResponse.json({ event });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.event.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("مناسبت پیدا نشد", 404);
  }
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
