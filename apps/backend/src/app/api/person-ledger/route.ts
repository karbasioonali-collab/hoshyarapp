import { NextRequest, NextResponse } from "next/server";
import { PERSON_DIRECTIONS, personLedgerEntryInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// direction=DEBT برای «بدهی به اشخاص»، direction=RECEIVABLE برای «طلب از اشخاص»
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const direction = searchParams.get("direction");
  if (!direction || !PERSON_DIRECTIONS.includes(direction as (typeof PERSON_DIRECTIONS)[number])) {
    throw new ApiError("پارامتر direction معتبر نیست", 400);
  }
  const entries = await prisma.personLedgerEntry.findMany({
    where: { userId, direction: direction as (typeof PERSON_DIRECTIONS)[number] },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, personLedgerEntryInputSchema);
  const entry = await prisma.personLedgerEntry.create({ data: { userId, ...input } });
  return NextResponse.json({ entry }, { status: 201 });
});
