import { NextRequest, NextResponse } from "next/server";
import { requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { settlePersonEntry } from "@/lib/ledger-service";

export const POST = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const { events } = await settlePersonEntry(userId, params.id);
  return NextResponse.json({ ok: true, events });
});
