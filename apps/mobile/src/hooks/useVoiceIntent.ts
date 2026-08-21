import { useCallback, useState } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { sendVoiceIntent, transcribeAudio } from "@/api/ai";
import { useToast } from "@/components/ui/ToastProvider";
import { useVoiceRecorder } from "./useVoiceRecorder";

/**
 * جریان کامل ورودی ویس یک صفحه: ضبط -> تبدیل به متن (STT) -> تشخیص Intent -> اجرا.
 * اصل fallback: اگه ویس/STT شکست بخوره، کاربر همچنان می‌تونه با تایپ (runTextIntent) همون کار رو انجام بده.
 */
export function useVoiceIntent(pageContext: string) {
  const { start, stop, isRecording } = useVoiceRecorder();
  const { showMessages, showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const applyResponse = useCallback(
    (response: Awaited<ReturnType<typeof sendVoiceIntent>>) => {
      if (response.action.type === "ask_clarification") {
        showMessages([response.action.question]);
      } else {
        showMessages([response.message, ...(response.ledgerMessages ?? [])]);
      }
      queryClient.invalidateQueries();
      if (response.navigateTo?.path) {
        router.push(response.navigateTo.path as never);
      }
      return response;
    },
    [queryClient, showMessages],
  );

  const runTextIntent = useCallback(
    async (text: string) => {
      setIsProcessing(true);
      try {
        const response = await sendVoiceIntent({ text, inputType: "TEXT", pageContext });
        return applyResponse(response);
      } catch (error) {
        showError(error instanceof Error ? error.message : "ثبت با متن انجام نشد");
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [applyResponse, pageContext, showError],
  );

  const startRecording = useCallback(async () => {
    try {
      await start();
    } catch (error) {
      showError(error instanceof Error ? error.message : "دسترسی به میکروفون ممکن نشد؛ به‌جاش تایپ کنید");
    }
  }, [start, showError]);

  const stopRecordingAndRun = useCallback(async () => {
    setIsProcessing(true);
    try {
      const audio = await stop();
      if (!audio) throw new Error("صدایی ضبط نشد");
      const { text } = await transcribeAudio(audio.base64, audio.mimeType);
      if (!text) throw new Error("متوجه صدا نشدم؛ می‌شه تایپ کنید؟");
      const response = await sendVoiceIntent({ text, inputType: "VOICE", pageContext });
      return applyResponse(response);
    } catch (error) {
      showError(error instanceof Error ? error.message : "ثبت با ویس انجام نشد؛ به‌جاش تایپ کنید");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [stop, applyResponse, pageContext, showError]);

  return { isRecording, isProcessing, startRecording, stopRecordingAndRun, runTextIntent };
}
