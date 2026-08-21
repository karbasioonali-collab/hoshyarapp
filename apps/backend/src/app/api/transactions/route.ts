import { NextRequest, NextResponse } from "next/server";
import { transactionInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { recordTransaction } from "@/lib/ledger-service";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const branch = searchParams.get("branch");
  const months = searchParams.get("months");

  const occurredOn = months
    ? { gte: new Date(Date.now() - Number(months) * 30 * 24 * 60 * 60 * 1000) }
    : undefined;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(categoryId ? { categoryId } : {}),
      ...(branch ? { category: { branch: branch as never } } : {}),
      ...(occurredOn ? { occurredOn } : {}),
    },
    include: { category: true, bankAccount: true },
    orderBy: { occurredOn: "desc" },
  });
  return NextResponse.json({ transactions });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, transactionInputSchema);
  const { transaction, events } = await recordTransaction(userId, input);
  return NextResponse.json({ transaction, events }, { status: 201 });
});
