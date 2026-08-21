import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { submitOnboarding } from "@/api/onboarding";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function OnboardingScreen() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [housingCost, setHousingCost] = useState("");
  const [carCost, setCarCost] = useState("");
  const [loading, setLoading] = useState(false);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { showError } = useToast();

  async function handleSubmit() {
    setLoading(true);
    try {
      await submitOnboarding({
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
        housingCost: housingCost ? Number(housingCost) : undefined,
        carCost: carCost ? Number(carCost) : undefined,
      });
      updateUser({ onboardingCompleted: true });
      router.replace("/home");
    } catch (error) {
      showError(error instanceof Error ? error.message : "ثبت اطلاعات انجام نشد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text className="text-navy text-xl font-bold text-center mb-2">بذارید یه آشنایی اولیه داشته باشیم</Text>
      <Text className="text-center mb-8" style={{ color: "#64748b" }}>
        این اطلاعات فقط برای برنامه‌ریزی بهتره؛ هر وقت خواستید می‌تونید تغییرشون بدید
      </Text>

      <TextField label="درآمد ماهانه (تومان)" keyboardType="numeric" value={monthlyIncome} onChangeText={setMonthlyIncome} />
      <TextField label="اجاره یا قسط خونه (تومان)" keyboardType="numeric" value={housingCost} onChangeText={setHousingCost} />
      <TextField label="قسط یا هزینه‌ی ماشین (تومان)" keyboardType="numeric" value={carCost} onChangeText={setCarCost} />

      <View className="mt-4">
        <Button title="بزن بریم" onPress={handleSubmit} loading={loading} />
      </View>
    </ScrollView>
  );
}
