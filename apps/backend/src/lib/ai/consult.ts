import { BRANCH_LABELS, formatTomanPhrase } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { getAiProvider } from "@/lib/ai";

export interface ConsultRequest {
  text: string;
  inputType: "VOICE" | "TEXT";
  wantsAudio?: boolean;
}

export interface ConsultResponse {
  message: string;
  audioBase64?: string;
}

async function buildHistorySummary(userId: string): Promise<string> {
  const since = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const transactions = await prisma.transaction.findMany({
    where: { userId, occurredOn: { gte: since }, status: "PAID" },
    include: { category: true },
  });

  const byCategory = new Map<string, number>();
  for (const tx of transactions) {
    const key = `${BRANCH_LABELS[tx.category.branch]} - ${tx.category.name}`;
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(tx.amount));
  }

  if (byCategory.size === 0) {
    return "کاربر هنوز هیچ تراکنشی ثبت نکرده.";
  }

  return Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => `- ${name}: ${formatTomanPhrase(total)} (۶ ماه اخیر)`)
    .join("\n");
}

export async function runConsult(userId: string, request: ConsultRequest): Promise<ConsultResponse> {
  const provider = getAiProvider();
  const historySummary = await buildHistorySummary(userId);

  const raw = await provider.chatComplete([
    {
      role: "system",
      content: `تو مشاور مالی شخصی «هوشیار» هستی. با توجه به تاریخچه‌ی مالی کاربر، پیشنهاد
عملی و ساده و کوتاه (حداکثر چند جمله، فارسی صمیمی) بده - نه توضیح پیچیده. اگه لازمه
پیشنهاد بده کدوم هزینه‌ها رو کم کنه.

تاریخچه‌ی ۶ ماه اخیر:
${historySummary}`,
    },
    { role: "user", content: request.text },
  ]);

  const response: ConsultResponse = { message: raw.content };

  if (request.wantsAudio) {
    try {
      const speech = await provider.synthesizeSpeech(response.message);
      if (speech.audioBase64) response.audioBase64 = speech.audioBase64;
    } catch {
      // fallback به متن
    }
  }

  await prisma.voiceInteraction.create({
    data: {
      userId,
      inputType: request.inputType,
      rawText: request.text,
      actionTaken: { message: response.message },
      pageContext: "/moshavere",
    },
  });

  return response;
}
