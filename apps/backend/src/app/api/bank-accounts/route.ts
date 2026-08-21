import { NextRequest, NextResponse } from "next/server";
import { bankAccountInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const accounts = await prisma.bankAccount.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ accounts });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, bankAccountInputSchema);
  const count = await prisma.bankAccount.count({ where: { userId } });
  const account = await prisma.bankAccount.create({
    data: {
      userId,
      name: input.name,
      balance: input.balance ?? 0,
      description: input.description,
      sortOrder: count,
    },
  });
  return NextResponse.json({ account }, { status: 201 });
});
