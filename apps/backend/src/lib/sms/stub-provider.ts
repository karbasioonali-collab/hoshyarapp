import type { SmsProvider } from "@hoshyar/shared";

// پیاده‌سازی پیش‌فرض: کد رو فقط لاگ می‌کنه (برای توسعه‌ی محلی و قبل از وصل‌شدن provider واقعی)
export const stubSmsProvider: SmsProvider = {
  name: "stub",
  async sendOtp(phone, code) {
    // eslint-disable-next-line no-console
    console.log(`[SMS stub] کد ورود برای ${phone}: ${code}`);
  },
};
