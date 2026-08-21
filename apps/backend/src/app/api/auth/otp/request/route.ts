import { NextRequest, NextResponse } from "next/server";
import { requestOtpSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { generateOtpCode } from "@/lib/auth";
import { getSmsProvider } from "@/lib/sms";
import { parseBody, withErrorHandling } from "@/lib/api-helpers";

const OTP_TTL_MINUTES = 5;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { phone } = await parseBody(request, requestOtpSchema);

  const code = generateOtpCode();
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  await getSmsProvider().sendOtp(phone, code);

  return NextResponse.json({ ok: true, expiresInMinutes: OTP_TTL_MINUTES });
});
