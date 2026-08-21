import type { AiProvider } from "@hoshyar/shared";
import { stubAiProvider } from "./stub-provider";

// انتخاب provider از env var (AI_PROVIDER=avalai|metis|stub). پیاده‌سازی‌های واقعی
// (آوالای/متیس) در فاز بعدی به همین لیست اضافه می‌شن؛ بقیه‌ی اپ فقط این تابع رو صدا می‌زنه
// و از جزئیات provider بی‌خبره.
export function getAiProvider(): AiProvider {
  const providerName = process.env.AI_PROVIDER ?? "stub";
  switch (providerName) {
    case "stub":
    default:
      return stubAiProvider;
  }
}
