import { NextRequest, NextResponse } from "next/server";
import { reminderInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: [{ jalaliYear: "asc" }, { jalaliMonth: "asc" }, { jalaliDay: "asc" }],
  });
  return NextResponse.json({ reminders });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, reminderInputSchema);
  const reminder = await prisma.reminder.create({ data: { userId, ...input } });
  return NextResponse.json({ reminder }, { status: 201 });
});
