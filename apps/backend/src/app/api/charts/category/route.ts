import { NextRequest, NextResponse } from "next/server";
import { toJalali } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { ApiError, requireUserId, withErrorHandling } from "@/lib/api-helpers";

// نمودار روند یک زیرشاخه در طول ماه‌های گذشته (برای صفحه‌ی زیرمجموعه، مثلاً «سوپر» یا «حقوق»)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const months = Number(searchParams.get("months") ?? 6);
  if (!categoryId) {
    throw new ApiError("پارامتر categoryId لازمه", 400);
  }

  // شامل زیرشاخه‌های این دسته هم می‌شه (اگه خودش یک دسته‌ی میانی مثل «مواد غذایی» باشه)
  const descendantIds = await collectDescendantIds(categoryId, userId);

  const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
  const transactions = await prisma.transaction.findMany({
    where: { userId, occurredOn: { gte: since }, status: "PAID", categoryId: { in: descendantIds } },
    select: { occurredOn: true, amount: true },
  });

  const buckets = new Map<string, number>();
  for (const tx of transactions) {
    const { jy, jm } = toJalali(tx.occurredOn);
    const key = `${jy}-${String(jm).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + Number(tx.amount));
  }

  const points = Array.from(buckets.entries())
    .map(([key, total]) => {
      const [jy, jm] = key.split("-").map(Number);
      return { jy, jm, total };
    })
    .sort((a, b) => a.jy - b.jy || a.jm - b.jm);

  return NextResponse.json({ points });
});

async function collectDescendantIds(rootId: string, userId: string): Promise<string[]> {
  const all = await prisma.category.findMany({ where: { OR: [{ userId }, { userId: null }] } });
  const byParent = new Map<string, string[]>();
  for (const c of all) {
    if (!c.parentId) continue;
    byParent.set(c.parentId, [...(byParent.get(c.parentId) ?? []), c.id]);
  }
  const result: string[] = [rootId];
  const queue = [rootId];
  while (queue.length) {
    const current = queue.shift()!;
    for (const childId of byParent.get(current) ?? []) {
      result.push(childId);
      queue.push(childId);
    }
  }
  return result;
}
