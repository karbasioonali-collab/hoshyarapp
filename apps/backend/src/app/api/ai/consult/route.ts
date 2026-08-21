import { NextRequest, NextResponse } from "next/server";
import { consultRequestSchema } from "@hoshyar/shared";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { runConsult } from "@/lib/ai/consult";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, consultRequestSchema);
  const result = await runConsult(userId, input);
  return NextResponse.json(result);
});
