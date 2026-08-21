import { NextRequest, NextResponse } from "next/server";
import { eventInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: [{ jalaliMonth: "asc" }, { jalaliDay: "asc" }],
  });
  return NextResponse.json({ events });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, eventInputSchema);
  const event = await prisma.event.create({ data: { userId, ...input } });
  return NextResponse.json({ event }, { status: 201 });
});
