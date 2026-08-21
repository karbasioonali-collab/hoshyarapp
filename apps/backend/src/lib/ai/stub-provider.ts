import type { AiProvider } from "@hoshyar/shared";

// پیاده‌سازی پیش‌فرض/توسعه: بدون فراخوانی سرویس خارجی، فقط برای اینکه بقیه‌ی اپ
// بدون کلید API واقعی هم قابل توسعه و تست باشه.
export const stubAiProvider: AiProvider = {
  name: "stub",
  async transcribe() {
    return { text: "" };
  },
  async chatComplete(messages) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    return {
      content: JSON.stringify({
        message: "متوجه نشدم، می‌شه دوباره بگید؟",
        action: {
          type: "ask_clarification",
          question: lastUserMessage?.content
            ? `منظورتون از «${lastUserMessage.content}» چیه؟`
            : "چی می‌خواستید ثبت کنید؟",
        },
      }),
    };
  },
  async synthesizeSpeech() {
    return { audioBase64: "", mimeType: "audio/mpeg" };
  },
};
