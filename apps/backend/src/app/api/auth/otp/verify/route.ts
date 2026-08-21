import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { signAuthToken } from "@/lib/auth";
import { ApiError, parseBody, withErrorHandling } from "@/lib/api-helpers";
import { toPublicUser } from "@/lib/serializers";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { phone, code, name } = await parseBody(request, verifyOtpSchema);

  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    throw new ApiError("کد وارد شده معتبر نیست یا منقضی شده", 400);
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, name },
  });

  const token = await signAuthToken(user.id);
  return NextResponse.json({ token, user: toPublicUser(user) });
});
