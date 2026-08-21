import { NextRequest, NextResponse } from "next/server";
import { voiceIntentRequestSchema } from "@hoshyar/shared";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { runVoiceIntent } from "@/lib/ai/intent-orchestrator";

// نقطه‌ی ورود اصلی دستور ویس/تایپ: تشخیص می‌ده کجا باید ثبت بشه و مستقیم انجامش می‌ده،
// یا اگه چیزی معلوم نبود از کاربر سوال می‌پرسه.
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, voiceIntentRequestSchema);
  const result = await runVoiceIntent(userId, input);
  return NextResponse.json(result);
});
