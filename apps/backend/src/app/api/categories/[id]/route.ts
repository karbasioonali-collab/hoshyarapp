import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

const renameSchema = z.object({ name: z.string().min(1) });

// فقط دسته‌های دلخواهی که خود کاربر اضافه کرده قابل ویرایش/حذفن؛ دسته‌های پیش‌فرض سیستم دست‌نخورده می‌مونن
export const PATCH = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const { name } = await parseBody(request, renameSchema);
  const existing = await prisma.category.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("این دسته‌بندی قابل‌ویرایش نیست", 404);
  }
  const category = await prisma.category.update({ where: { id: params.id }, data: { name } });
  return NextResponse.json({ category });
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const existing = await prisma.category.findFirst({ where: { id: params.id, userId } });
  if (!existing) {
    throw new ApiError("این دسته‌بندی قابل‌حذف نیست", 404);
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
