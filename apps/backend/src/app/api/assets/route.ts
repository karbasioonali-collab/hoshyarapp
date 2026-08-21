import { NextRequest, NextResponse } from "next/server";
import { assetInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const assets = await prisma.asset.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, assetInputSchema);
  const asset = await prisma.asset.create({ data: { userId, ...input } });
  return NextResponse.json({ asset }, { status: 201 });
});
