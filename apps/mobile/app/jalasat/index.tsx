import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JALALI_MONTH_NAMES, todayJalali } from "@hoshyar/shared";
import { createAppointment, deleteAppointment, listAppointments, updateAppointment } from "@/api/schedule";
import type { Appointment } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { JalaliDateFields, TimeFields } from "@/components/ui/JalaliPickers";
import { useToast } from "@/components/ui/ToastProvider";

export default function JalasatScreen() {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const today = todayJalali();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState({ year: today.jy, month: today.jm, day: today.jd });
  const [time, setTime] = useState({ hour: 9, minute: 0 });

  function openCreate() {
    setEditing(null);
    setDescription("");
    setLocation("");
    setDate({ year: today.jy, month: today.jm, day: today.jd });
    setTime({ hour: 9, minute: 0 });
    setModalOpen(true);
  }

  function openEdit(row: Appointment) {
    setEditing(row);
    setDescription(row.description);
    setLocation(row.location ?? "");
    setDate({ year: row.jalaliYear, month: row.jalaliMonth, day: row.jalaliDay });
    const [h, m] = row.time.split(":").map(Number);
    setTime({ hour: h, minute: m });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        description,
        location: location || undefined,
        jalaliYear: date.year,
        jalaliMonth: date.month,
        jalaliDay: date.day,
        time: `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`,
      };
      if (editing) return updateAppointment(editing.id, input);
      return createAppointment(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setModalOpen(false);
      showMessages(["ثبت شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      showMessages(["حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">جلسات و قرارها</Text>

      <RecordTable<Appointment>
        title="جلسات و قرارها"
        tableKey="appointments"
        pageContext="/jalasat"
        rows={appointmentsQuery.data?.appointments ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز جلسه‌ای ثبت نکردید"
        columns={[
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description}</Text> },
          { key: "jalaliMonth", defaultLabel: "ماه", render: (row) => <Text>{JALALI_MONTH_NAMES[row.jalaliMonth - 1]}</Text> },
          { key: "jalaliDay", defaultLabel: "روز", render: (row) => <Text>{row.jalaliDay}</Text> },
          { key: "time", defaultLabel: "ساعت", render: (row) => <Text>{row.time}</Text> },
          { key: "location", defaultLabel: "محل", render: (row) => <Text>{row.location ?? "-"}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش جلسه" : "افزودن جلسه"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <JalaliDateFields year={date.year} month={date.month} day={date.day} onChange={setDate} />
        <TimeFields hour={time.hour} minute={time.minute} onChange={setTime} />
        <TextField label="محل" value={location} onChangeText={setLocation} />
      </FormModal>
    </ScrollView>
  );
}
