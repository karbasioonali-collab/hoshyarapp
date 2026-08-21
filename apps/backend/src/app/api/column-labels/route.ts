import { NextRequest, NextResponse } from "next/server";
import { columnLabelOverrideInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const overrides = await prisma.columnLabelOverride.findMany({ where: { userId } });
  return NextResponse.json({ overrides });
});

// نام‌گذاری دلخواه ستون توسط کاربر - اگه از قبل بوده به‌روزرسانی می‌شه
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, columnLabelOverrideInputSchema);
  const override = await prisma.columnLabelOverride.upsert({
    where: {
      userId_tableKey_columnKey: { userId, tableKey: input.tableKey, columnKey: input.columnKey },
    },
    update: { customLabel: input.customLabel },
    create: { userId, ...input },
  });
  return NextResponse.json({ override });
});
