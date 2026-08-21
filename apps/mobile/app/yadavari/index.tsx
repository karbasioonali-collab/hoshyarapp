import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JALALI_MONTH_NAMES, REMINDER_LEAD_TIME_PRESETS, todayJalali } from "@hoshyar/shared";
import { createReminder, deleteReminder, listReminders, updateReminder } from "@/api/schedule";
import type { Reminder } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { Dropdown } from "@/components/ui/Dropdown";
import { JalaliDateFields, TimeFields } from "@/components/ui/JalaliPickers";
import { useToast } from "@/components/ui/ToastProvider";

export default function YadavariScreen() {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const remindersQuery = useQuery({ queryKey: ["reminders"], queryFn: listReminders });
  const today = todayJalali();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState({ year: today.jy, month: today.jm, day: today.jd });
  const [time, setTime] = useState({ hour: 9, minute: 0 });
  const [leadTime, setLeadTime] = useState<string>("default");

  function openCreate() {
    setEditing(null);
    setDescription("");
    setDate({ year: today.jy, month: today.jm, day: today.jd });
    setTime({ hour: 9, minute: 0 });
    setLeadTime("default");
    setModalOpen(true);
  }

  function openEdit(row: Reminder) {
    setEditing(row);
    setDescription(row.description);
    setDate({ year: row.jalaliYear, month: row.jalaliMonth, day: row.jalaliDay });
    const [h, m] = row.time.split(":").map(Number);
    setTime({ hour: h, minute: m });
    setLeadTime(row.leadTimeMinutes ? String(row.leadTimeMinutes) : "default");
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        description,
        jalaliYear: date.year,
        jalaliMonth: date.month,
        jalaliDay: date.day,
        time: `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`,
        leadTimeMinutes: leadTime === "default" ? null : Number(leadTime),
      };
      if (editing) return updateReminder(editing.id, input);
      return createReminder(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setModalOpen(false);
      showMessages(["ثبت شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      showMessages(["حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">یادآوری‌ها</Text>

      <RecordTable<Reminder>
        title="یادآوری‌ها"
        tableKey="reminders"
        pageContext="/yadavari"
        rows={remindersQuery.data?.reminders ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز یادآوری‌ای ثبت نکردید"
        columns={[
          { key: "description", defaultLabel: "شرح", width: 160, render: (row) => <Text>{row.description}</Text> },
          { key: "jalaliMonth", defaultLabel: "ماه", render: (row) => <Text>{JALALI_MONTH_NAMES[row.jalaliMonth - 1]}</Text> },
          { key: "jalaliDay", defaultLabel: "روز", render: (row) => <Text>{row.jalaliDay}</Text> },
          { key: "time", defaultLabel: "ساعت", render: (row) => <Text>{row.time}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش یادآوری" : "افزودن یادآوری"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <JalaliDateFields year={date.year} month={date.month} day={date.day} onChange={setDate} />
        <TimeFields hour={time.hour} minute={time.minute} onChange={setTime} />
        <Dropdown
          label="بازه‌ی یادآوری"
          value={leadTime}
          onChange={setLeadTime}
          options={[
            { label: "پیش‌فرض تنظیمات", value: "default" },
            ...REMINDER_LEAD_TIME_PRESETS.map((p) => ({ label: p.label, value: p.minutes })),
          ]}
        />
      </FormModal>
    </ScrollView>
  );
}
