import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { updateMe } from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const { showMessages, showError } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const { user: updated } = await updateMe({ name });
      updateUser({ name: updated.name });
      showMessages(["پروفایل به‌روزرسانی شد"]);
    } catch (error) {
      showError(error instanceof Error ? error.message : "به‌روزرسانی انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">پروفایل</Text>
      <Card>
        <TextField label="نام" value={name} onChangeText={setName} />
        {user?.phone && <Text className="text-right mb-3" style={{ color: "#64748b" }}>موبایل: {user.phone}</Text>}
        {user?.email && <Text className="text-right mb-3" style={{ color: "#64748b" }}>ایمیل: {user.email}</Text>}
        <Button title="ذخیره" onPress={handleSave} loading={saving} />
      </Card>
    </ScrollView>
  );
}
