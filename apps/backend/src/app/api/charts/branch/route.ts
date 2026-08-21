import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_BRANCHES } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// نمودار مقایسه‌ای صفحه‌ی والد: مجموع هر زیرشاخه‌ی مستقیمِ parentId (یا سطح اول اگه
// parentId نداده بشه)، شامل مجموع زیرشاخه‌های تودرتوی خودش هم می‌شه
// (مثلاً «مواد غذایی» شامل «سوپر» و ... هم هست)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  const parentId = searchParams.get("parentId");
  const months = Number(searchParams.get("months") ?? 3);

  if (!branch || !CATEGORY_BRANCHES.includes(branch as (typeof CATEGORY_BRANCHES)[number])) {
    throw new ApiError("پارامتر branch معتبر نیست", 400);
  }

  const categories = await prisma.category.findMany({
    where: { branch: branch as (typeof CATEGORY_BRANCHES)[number], OR: [{ userId }, { userId: null }] },
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  // بالاترین جدِ یک دسته که مستقیماً زیر groupParentId (یا ریشه) قرار داره
  function groupAncestorId(categoryId: string): string {
    let current = categoryById.get(categoryId);
    while (current && current.parentId && current.parentId !== parentId) {
      const parent = categoryById.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current?.id ?? categoryId;
  }

  const groupCategories = categories.filter((c) => (parentId ? c.parentId === parentId : !c.parentId));

  const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
  const transactions = await prisma.transaction.findMany({
    where: { userId, occurredOn: { gte: since }, status: "PAID", categoryId: { in: [...categoryById.keys()] } },
    select: { categoryId: true, amount: true },
  });

  const totals = new Map<string, number>();
  for (const category of groupCategories) {
    totals.set(category.id, 0);
  }
  for (const tx of transactions) {
    const groupId = groupAncestorId(tx.categoryId);
    if (totals.has(groupId)) {
      totals.set(groupId, (totals.get(groupId) ?? 0) + Number(tx.amount));
    }
  }

  const result = groupCategories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ categoryId: c.id, name: c.name, total: totals.get(c.id) ?? 0 }));

  return NextResponse.json({ items: result });
});
