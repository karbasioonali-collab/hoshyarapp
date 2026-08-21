// اینترفیس انتزاعی برای سرویس واسط هوش مصنوعی (STT/LLM/TTS).
// پیاده‌سازی مشخص (آوالای/متیس/...) در apps/backend/src/lib/ai پشت همین اینترفیسه؛
// تعویض provider یعنی فقط عوض‌کردن پیاده‌سازی، بدون تغییر بقیه‌ی کد.

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AudioInput {
  base64: string;
  mimeType: string;
}

export interface TranscribeResult {
  text: string;
}

export interface ChatCompletionOptions {
  /** وقتی true باشه، از provider خواسته می‌شه خروجی JSON خالص بده (برای تشخیص Intent) */
  jsonMode?: boolean;
  temperature?: number;
}

export interface ChatCompletionResult {
  content: string;
}

export interface SpeechResult {
  audioBase64: string;
  mimeType: string;
}

export interface AiProvider {
  readonly name: string;
  transcribe(audio: AudioInput): Promise<TranscribeResult>;
  chatComplete(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResult>;
  synthesizeSpeech(text: string): Promise<SpeechResult>;
}

// اینترفیس انتزاعی برای پیامک OTP (کاوه‌نگار/ملی‌پیامک/...)
export interface SmsProvider {
  readonly name: string;
  sendOtp(phone: string, code: string): Promise<void>;
}
