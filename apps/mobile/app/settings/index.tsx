import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { REMINDER_LEAD_TIME_PRESETS } from "@hoshyar/shared";
import { updateMe } from "@/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { showMessages, showError } = useToast();
  const currentLeadTime = (user?.settings?.reminderLeadTimeMinutes as number) ?? REMINDER_LEAD_TIME_PRESETS[0].minutes;
  const [leadTime, setLeadTime] = useState(currentLeadTime);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const { user: updated } = await updateMe({ settings: { reminderLeadTimeMinutes: leadTime } });
      updateUser({ settings: updated.settings });
      showMessages(["تنظیمات ذخیره شد"]);
    } catch (error) {
      showError(error instanceof Error ? error.message : "ذخیره‌ی تنظیمات انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">تنظیمات</Text>
      <Card>
        <Text className="text-navy font-semibold mb-2 text-right">بازه‌ی پیش‌فرض یادآوری‌ها</Text>
        <Dropdown
          value={leadTime}
          onChange={(v) => setLeadTime(Number(v))}
          options={REMINDER_LEAD_TIME_PRESETS.map((p) => ({ label: p.label, value: p.minutes }))}
        />
        <Button title="ذخیره" onPress={handleSave} loading={saving} />
      </Card>
    </ScrollView>
  );
}
