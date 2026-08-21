import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Svg, { Line } from "react-native-svg";
import { useAuthStore } from "@/store/auth-store";
import { useVoiceIntent } from "@/hooks/useVoiceIntent";
import { VoiceMicButton } from "@/components/ui/VoiceMicButton";
import { colors } from "@/theme/colors";

const MAIN_BUTTONS = [
  { key: "hesab-o-ketab", label: "حساب و کتاب", href: "/hesab-o-ketab", emoji: "💰" },
  { key: "monasebat", label: "مناسبت‌ها", href: "/monasebat", emoji: "🎂" },
  { key: "jalasat", label: "جلسات و قرارها", href: "/jalasat", emoji: "🗓️" },
  { key: "yadavari", label: "یادآوری‌ها", href: "/yadavari", emoji: "⏰" },
  { key: "moshavere", label: "مشاوره", href: "/moshavere", emoji: "💡" },
] as const;

function MenuIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Line x1={4} y1={7} x2={20} y2={7} stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={12} x2={20} y2={12} stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
      <Line x1={4} y1={17} x2={20} y2={17} stroke={colors.navy} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState("");
  const { isProcessing, runTextIntent } = useVoiceIntent("/home");

  async function handleSend() {
    if (!text.trim()) return;
    await runTextIntent(text.trim());
    setText("");
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <View className="flex-row-reverse items-center justify-between mb-6">
        <Text className="text-navy text-lg font-bold">
          سلام{user?.name ? ` ${user.name}` : ""} 👋
        </Text>
        <Pressable onPress={() => router.push("/menu")}>
          <MenuIcon />
        </Pressable>
      </View>

      <View className="bg-white rounded-card p-4 mb-8" style={{ shadowColor: "#0a1a3f", shadowOpacity: 0.08, shadowRadius: 10 }}>
        <Text className="text-navy font-semibold mb-3 text-right">چی می‌خوای ثبت کنم؟</Text>
        <View className="flex-row-reverse items-center gap-2">
          <VoiceMicButton pageContext="/home" />
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            placeholder="مثلاً: ۲۰۰ تومن سوپر خریدم"
            placeholderTextColor="#94a3b8"
            editable={!isProcessing}
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-3"
            style={{ textAlign: "right", writingDirection: "rtl", color: colors.navy }}
          />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {MAIN_BUTTONS.map((btn) => (
          <Pressable
            key={btn.key}
            onPress={() => router.push(btn.href as never)}
            className="basis-[31%] grow aspect-square rounded-card items-center justify-center gap-2"
            style={{ backgroundColor: colors.navy }}
          >
            <Text style={{ fontSize: 28 }}>{btn.emoji}</Text>
            <Text className="text-white text-center font-semibold text-xs">{btn.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
