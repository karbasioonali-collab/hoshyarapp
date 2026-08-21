import { NextRequest, NextResponse } from "next/server";
import { appointmentInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, appointmentInputSchema.partial());
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("جلسه پیدا نشد", 404);
  }
  const appointment = await prisma.appointment.update({ where: { id: params.id }, data: input });
  return NextResponse.json({ appointment });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("جلسه پیدا نشد", 404);
  }
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
