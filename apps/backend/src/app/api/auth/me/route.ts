import { NextRequest, NextResponse } from "next/server";
import { updateProfileSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { toPublicUser } from "@/lib/serializers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError("کاربر پیدا نشد", 404);
  }
  return NextResponse.json({ user: toPublicUser(user) });
});

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, updateProfileSchema);
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new ApiError("کاربر پیدا نشد", 404);
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name ?? existing.name,
      settings: {
        ...(existing.settings as Record<string, unknown>),
        ...(input.settings ?? {}),
      },
    },
  });
  return NextResponse.json({ user: toPublicUser(user) });
});
