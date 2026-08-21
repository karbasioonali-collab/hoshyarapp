import { NextRequest, NextResponse } from "next/server";
import { onboardingInputSchema } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { parseBody, requireUserId, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const answer = await prisma.onboardingAnswer.findUnique({ where: { userId } });
  return NextResponse.json({ answer });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = await requireUserId(request);
  const input = await parseBody(request, onboardingInputSchema);

  const [answer] = await prisma.$transaction([
    prisma.onboardingAnswer.upsert({
      where: { userId },
      update: {
        monthlyIncome: input.monthlyIncome,
        housingCost: input.housingCost,
        carCost: input.carCost,
        otherFixedCosts: input.otherFixedCosts ?? [],
      },
      create: {
        userId,
        monthlyIncome: input.monthlyIncome,
        housingCost: input.housingCost,
        carCost: input.carCost,
        otherFixedCosts: input.otherFixedCosts ?? [],
      },
    }),
    prisma.user.update({ where: { id: userId }, data: { onboardingCompleted: true } }),
  ]);

  return NextResponse.json({ answer });
});
