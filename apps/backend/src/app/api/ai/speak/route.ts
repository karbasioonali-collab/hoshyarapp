import { NextRequest, NextResponse } from "next/server";
import { speakRequestSchema } from "@hoshyar/shared";
import { getAiProvider } from "@/lib/ai";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// متن -> صدا. اگه این ناموفق بود، اپ موبایل باید همون متن رو نشون بده (fallback به متن).
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireUserId(request);
  const { text } = await parseBody(request, speakRequestSchema);
  const result = await getAiProvider().synthesizeSpeech(text);
  return NextResponse.json(result);
});
