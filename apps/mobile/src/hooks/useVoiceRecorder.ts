import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

// ضبط ویس با expo-av و برگردوندن base64 برای فرستادن به /api/ai/transcribe.
// اصل fallback: اگه هر جای این مسیر خطا بده، صدا زده نمی‌شه و کاربر می‌تونه به‌جاش تایپ کنه.
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = useCallback(async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("اجازه‌ی دسترسی به میکروفون داده نشده");
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setIsRecording(true);
  }, []);

  const stop = useCallback(async (): Promise<{ base64: string; mimeType: string } | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;
    if (!uri) return null;
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return { base64, mimeType: "audio/m4a" };
  }, []);

  return { isRecording, start, stop };
}
