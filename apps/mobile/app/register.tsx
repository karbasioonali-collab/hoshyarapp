import React, { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { registerWithEmail } from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showError } = useToast();

  async function handleSubmit() {
    setLoading(true);
    try {
      const { token, user } = await registerWithEmail(email, password, name || undefined);
      setAuth(token, user);
      router.replace("/onboarding");
    } catch (error) {
      showError(error instanceof Error ? error.message : "ثبت‌نام انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-navy text-2xl font-bold text-center mb-8">ثبت‌نام در هوشیار</Text>
      <TextField label="نام" value={name} onChangeText={setName} />
      <TextField label="ایمیل" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextField label="رمز عبور" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="ثبت‌نام" onPress={handleSubmit} loading={loading} />
    </View>
  );
}
