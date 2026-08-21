import { NextRequest, NextResponse } from "next/server";
import { transactionUpdateSchema } from "@hoshyar/shared";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { deleteTransaction, updateTransaction } from "@hoshyar/database";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, transactionUpdateSchema);
  const { transaction, events } = await updateTransaction(userId, params.id, input);
  return NextResponse.json({ transaction, events });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const { events } = await deleteTransaction(userId, params.id);
  return NextResponse.json({ ok: true, events });
});
