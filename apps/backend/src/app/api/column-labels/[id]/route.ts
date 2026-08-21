import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// حذف override یعنی برگشت به نام پیش‌فرض ستون
export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.columnLabelOverride.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("موردی پیدا نشد", 404);
  }
  await prisma.columnLabelOverride.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
