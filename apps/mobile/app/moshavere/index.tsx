import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { askConsult, transcribeAudio } from "@/api/ai";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MicIcon } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/ToastProvider";
import { colors } from "@/theme/colors";

interface ChatMessage {
  id: string;
  from: "user" | "ai";
  text: string;
}

export default function MoshavereScreen() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();
  const { isRecording, start, stop } = useVoiceRecorder();

  async function send(question: string, inputType: "TEXT" | "VOICE" = "TEXT") {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, from: "user", text: question }]);
    setText("");
    setLoading(true);
    try {
      const { message } = await askConsult(question, inputType);
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, from: "ai", text: message }]);
    } catch (error) {
      showError(error instanceof Error ? error.message : "پاسخ گرفته نشد");
    } finally {
      setLoading(false);
    }
  }

  async function handleMicPress() {
    if (loading) return;
    if (isRecording) {
      setLoading(true);
      try {
        const audio = await stop();
        if (!audio) throw new Error("صدایی ضبط نشد");
        const { text: transcript } = await transcribeAudio(audio.base64, audio.mimeType);
        if (!transcript) throw new Error("متوجه صدا نشدم؛ می‌شه تایپ کنید؟");
        setLoading(false);
        await send(transcript, "VOICE");
      } catch (error) {
        setLoading(false);
        showError(error instanceof Error ? error.message : "ثبت با ویس انجام نشد؛ به‌جاش تایپ کنید");
      }
    } else {
      try {
        await start();
      } catch (error) {
        showError(error instanceof Error ? error.message : "دسترسی به میکروفون ممکن نشد؛ به‌جاش تایپ کنید");
      }
    }
  }

  return (
    <View className="flex-1 bg-bg px-5" style={{ paddingTop: 56 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-2 text-right">مشاوره</Text>
      <Text className="mb-4 text-right" style={{ color: "#64748b" }}>
        در این صفحه شما از سیستم مشاوره می‌گیرید. مثلاً بپرسید: «می‌خوام ۲ ماه دیگه سفر برم، هزینه‌شو چیکار کنم؟»
      </Text>

      <ScrollView className="flex-1 mb-3" showsVerticalScrollIndicator={false}>
        {messages.map((m) => (
          <Card key={m.id} className={`mb-2 ${m.from === "user" ? "bg-navy" : "bg-white"}`}>
            <Text style={{ color: m.from === "user" ? "#fff" : colors.navy, textAlign: "right", writingDirection: "rtl" }}>
              {m.text}
            </Text>
          </Card>
        ))}
      </ScrollView>

      <View className="flex-row-reverse items-center gap-2 mb-6">
        <Pressable
          onPress={handleMicPress}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: isRecording ? colors.danger : colors.turquoiseDark,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <MicIcon size={20} />}
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => send(text)}
          editable={!loading}
          placeholder="سوالتون رو تایپ کنید"
          placeholderTextColor="#94a3b8"
          className="flex-1 bg-white rounded-2xl px-4 py-3"
          style={{ textAlign: "right", writingDirection: "rtl", color: colors.navy }}
        />
      </View>
      <Button title="تایپ کنید و بفرستید" onPress={() => send(text)} loading={loading} className="mb-6" />
    </View>
  );
}
