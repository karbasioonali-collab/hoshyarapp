import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_BRANCHES, categoryInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  const parentId = searchParams.get("parentId");

  if (!branch || !CATEGORY_BRANCHES.includes(branch as (typeof CATEGORY_BRANCHES)[number])) {
    throw new ApiError("پارامتر branch معتبر نیست", 400);
  }

  const categories = await prisma.category.findMany({
    where: {
      branch: branch as (typeof CATEGORY_BRANCHES)[number],
      parentId: parentId || null,
      OR: [{ userId }, { userId: null }],
    },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ categories });
});

// افزودن دسته‌بندی دلخواه جدید - همیشه به کاربر لینک می‌شه، دسته‌های سیستمی دست‌نخورده می‌مونن
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, categoryInputSchema);

  if (input.parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: input.parentId, branch: input.branch, OR: [{ userId }, { userId: null }] },
    });
    if (!parent) {
      throw new ApiError("دسته‌ی والد پیدا نشد", 404);
    }
  }

  const siblingCount = await prisma.category.count({
    where: { branch: input.branch, parentId: input.parentId ?? null, OR: [{ userId }, { userId: null }] },
  });

  const category = await prisma.category.create({
    data: {
      branch: input.branch,
      parentId: input.parentId ?? null,
      userId,
      name: input.name,
      sortOrder: siblingCount,
    },
  });
  return NextResponse.json({ category }, { status: 201 });
});
