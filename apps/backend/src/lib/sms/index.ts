import type { SmsProvider } from "@hoshyar/shared";
import { stubSmsProvider } from "./stub-provider";

// انتخاب provider از env var - بعداً با اضافه‌کردن یک فایل جدید (مثلاً kavenegar-provider.ts)
// و یک شرط اینجا، بدون تغییر بقیه‌ی کد میشه provider واقعی رو وصل کرد.
export function getSmsProvider(): SmsProvider {
  const providerName = process.env.SMS_PROVIDER ?? "stub";
  switch (providerName) {
    case "stub":
    default:
      return stubSmsProvider;
  }
}
