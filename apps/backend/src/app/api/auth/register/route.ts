import { NextRequest, NextResponse } from "next/server";
import { emailRegisterSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { hashPassword, signAuthToken } from "@/lib/auth";
import { ApiError, parseBody, withErrorHandling } from "@/lib/api-helpers";
import { toPublicUser } from "@/lib/serializers";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email, password, name } = await parseBody(request, emailRegisterSchema);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError("این ایمیل قبلاً ثبت شده", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });

  const token = await signAuthToken(user.id);
  return NextResponse.json({ token, user: toPublicUser(user) }, { status: 201 });
});
