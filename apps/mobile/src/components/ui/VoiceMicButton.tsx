import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { colors } from "@/theme/colors";
import { useVoiceIntent } from "@/hooks/useVoiceIntent";
import { MicIcon } from "./Icons";

interface VoiceMicButtonProps {
  /** مسیر صفحه‌ی فعلی، برای اینکه AI بدونه کاربر کجاست */
  pageContext: string;
  size?: number;
}

/** آیکون میکروفون خطی - یک بار لمس برای شروع ضبط، بار دوم برای پایان و ارسال */
export function VoiceMicButton({ pageContext, size = 46 }: VoiceMicButtonProps) {
  const { isRecording, isProcessing, startRecording, stopRecordingAndRun } = useVoiceIntent(pageContext);

  function handlePress() {
    if (isProcessing) return;
    if (isRecording) {
      stopRecordingAndRun();
    } else {
      startRecording();
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isRecording ? colors.danger : colors.turquoiseDark,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isProcessing ? <ActivityIndicator color="#fff" /> : <MicIcon size={size * 0.45} />}
    </Pressable>
  );
}
