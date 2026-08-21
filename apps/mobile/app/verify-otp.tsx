import React, { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { verifyOtp } from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showError } = useToast();

  async function handleSubmit() {
    setLoading(true);
    try {
      const { token, user } = await verifyOtp(phone, code);
      setAuth(token, user);
      router.replace(user.onboardingCompleted ? "/home" : "/onboarding");
    } catch (error) {
      showError(error instanceof Error ? error.message : "کد وارد شده صحیح نیست");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-navy text-xl font-bold text-center mb-2">کد ورود رو وارد کنید</Text>
      <Text className="text-center mb-8" style={{ color: "#64748b" }}>
        کد ۵ رقمی برای {phone} پیامک شد
      </Text>
      <TextField keyboardType="number-pad" placeholder="۱۲۳۴۵" value={code} onChangeText={setCode} maxLength={5} />
      <Button title="تایید" onPress={handleSubmit} loading={loading} />
    </View>
  );
}
