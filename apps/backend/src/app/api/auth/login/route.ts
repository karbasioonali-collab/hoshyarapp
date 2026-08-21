import { NextRequest, NextResponse } from "next/server";
import { emailLoginSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { signAuthToken, verifyPassword } from "@/lib/auth";
import { ApiError, parseBody, withErrorHandling } from "@/lib/api-helpers";
import { toPublicUser } from "@/lib/serializers";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email, password } = await parseBody(request, emailLoginSchema);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError("ایمیل یا رمز عبور اشتباهه", 401);
  }

  const token = await signAuthToken(user.id);
  return NextResponse.json({ token, user: toPublicUser(user) });
});
