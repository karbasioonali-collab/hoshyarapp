import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { toPublicUser } from "@/lib/serializers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError("کاربر پیدا نشد", 404);
  }
  return NextResponse.json({ user: toPublicUser(user) });
});
