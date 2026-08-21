import type { VoiceIntentRequest, VoiceIntentResponse } from "@hoshyar/shared";
import { api } from "./client";

export function transcribeAudio(audioBase64: string, mimeType: string) {
  return api.post<{ text: string }>("/api/ai/transcribe", { audioBase64, mimeType });
}

export function speakText(text: string) {
  return api.post<{ audioBase64: string; mimeType: string }>("/api/ai/speak", { text });
}

export function sendVoiceIntent(input: VoiceIntentRequest) {
  return api.post<VoiceIntentResponse>("/api/ai/intent", input);
}

export function askConsult(text: string, inputType: "VOICE" | "TEXT") {
  return api.post<{ message: string; audioBase64?: string }>("/api/ai/consult", { text, inputType });
}
