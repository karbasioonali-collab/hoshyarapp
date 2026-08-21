import { NextRequest, NextResponse } from "next/server";
import { appointmentInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: [{ jalaliYear: "asc" }, { jalaliMonth: "asc" }, { jalaliDay: "asc" }],
  });
  return NextResponse.json({ appointments });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, appointmentInputSchema);
  const appointment = await prisma.appointment.create({ data: { userId, ...input } });
  return NextResponse.json({ appointment }, { status: 201 });
});
