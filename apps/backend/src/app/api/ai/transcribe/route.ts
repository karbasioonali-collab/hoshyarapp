import { NextRequest, NextResponse } from "next/server";
import { transcribeRequestSchema } from "@hoshyar/shared";
import { getAiProvider } from "@/lib/ai";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// ورودی ویس -> متن. اگه این ناموفق بود، اپ موبایل باید خودکار به تایپ سقوط کنه (fallback).
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireUserId(request);
  const input = await parseBody(request, transcribeRequestSchema);
  const result = await getAiProvider().transcribe({ base64: input.audioBase64, mimeType: input.mimeType });
  return NextResponse.json(result);
});
