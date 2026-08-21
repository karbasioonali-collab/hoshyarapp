import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { loginWithEmail, requestOtp } from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginScreen() {
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showError } = useToast();

  async function handlePhoneSubmit() {
    if (!/^09\d{9}$/.test(phone)) return showError("شماره موبایل معتبر نیست");
    setLoading(true);
    try {
      await requestOtp(phone);
      router.push({ pathname: "/verify-otp", params: { phone } });
    } catch (error) {
      showError(error instanceof Error ? error.message : "ارسال کد انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit() {
    setLoading(true);
    try {
      const { token, user } = await loginWithEmail(email, password);
      setAuth(token, user);
      router.replace(user.onboardingCompleted ? "/home" : "/onboarding");
    } catch (error) {
      showError(error instanceof Error ? error.message : "ورود انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-bg justify-center px-6">
      <Text className="text-navy text-2xl font-bold text-center mb-1">هوشیار</Text>
      <Text className="text-center mb-8" style={{ color: "#64748b" }}>
        دستیار مالی شخصی شما
      </Text>

      <View className="flex-row-reverse bg-white rounded-2xl p-1 mb-5 self-center">
        <TabButton label="ورود با موبایل" active={tab === "phone"} onPress={() => setTab("phone")} />
        <TabButton label="ورود با ایمیل" active={tab === "email"} onPress={() => setTab("email")} />
      </View>

      {tab === "phone" ? (
        <>
          <TextField
            label="شماره موبایل"
            keyboardType="phone-pad"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChangeText={setPhone}
          />
          <Button title="دریافت کد ورود" onPress={handlePhoneSubmit} loading={loading} />
        </>
      ) : (
        <>
          <TextField label="ایمیل" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextField label="رمز عبور" secureTextEntry value={password} onChangeText={setPassword} />
          <Button title="ورود" onPress={handleEmailSubmit} loading={loading} />
          <Pressable onPress={() => router.push("/register")} className="mt-4">
            <Text className="text-center text-turquoise-dark">حساب ندارید؟ ثبت‌نام کنید</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`px-4 py-2 rounded-xl ${active ? "bg-navy" : ""}`}>
      <Text className={active ? "text-white text-xs" : "text-navy text-xs"}>{label}</Text>
    </Pressable>
  );
}
