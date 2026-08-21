import type { CategoryBranch } from "./enums";

// وقتی کاربر با ویس یا تایپ چیزی می‌گه، بک‌اند این ساختار رو از LLM بیرون می‌کشه
// و بر همون اساس یا مستقیم ثبت می‌کنه، یا صفحه‌ی مرتبط رو باز می‌کنه، یا از کاربر سوال می‌پرسه.

export interface AddTransactionAction {
  type: "add_transaction";
  branch: CategoryBranch;
  categoryName: string;
  amount: number;
  bankAccountName?: string;
  description?: string;
  /** تاریخ شمسی به‌صورت YYYY-MM-DD؛ اگه نباشه یعنی امروز */
  occurredOnJalali?: string;
}

export interface PayInstallmentAction {
  type: "pay_installment";
  installmentDescription: string;
}

export interface CreateInstallmentAction {
  type: "create_installment";
  description: string;
  totalAmount: number;
  monthsCount: number;
  payDay: number;
  bankAccountName?: string;
}

export interface NavigateAction {
  type: "navigate";
  path: string;
}

export interface AskClarificationAction {
  type: "ask_clarification";
  question: string;
}

export type VoiceAction =
  | AddTransactionAction
  | PayInstallmentAction
  | CreateInstallmentAction
  | NavigateAction
  | AskClarificationAction;

export interface VoiceIntentRequest {
  /** اگه ورودی صوتی بود، متن پیاده‌شده؛ اگه تایپ بود همون متن کاربر */
  text: string;
  inputType: "VOICE" | "TEXT";
  /** مسیر صفحه‌ای که کاربر الان توش هست، برای context بهتر */
  pageContext?: string;
  /** آیا خروجی صوتی (TTS) هم لازمه یا صرفاً متن کافیه */
  wantsAudio?: boolean;
}

export interface VoiceIntentResponse {
  /** جمله‌ی فارسی ساده برای نمایش/پخش به کاربر */
  message: string;
  action: VoiceAction;
  audioBase64?: string;
  /** اگه اقدام باعث ثبت چیزی شد، لیست جمله‌های توضیح سرویس مرکزی حسابداری */
  ledgerMessages?: string[];
  /** مقصد ناوبری پیشنهادی برای اپ موبایل (اگه لازم باشه صفحه‌ای باز بشه) */
  navigateTo?: { branch?: string; categoryId?: string; path?: string };
}
