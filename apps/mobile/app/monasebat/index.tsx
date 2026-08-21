import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JALALI_MONTH_NAMES, todayJalali } from "@hoshyar/shared";
import { createEvent, deleteEvent, listEvents, updateEvent } from "@/api/schedule";
import type { EventItem } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { JalaliDateFields } from "@/components/ui/JalaliPickers";
import { useToast } from "@/components/ui/ToastProvider";

export default function MonasebatScreen() {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const eventsQuery = useQuery({ queryKey: ["events"], queryFn: listEvents });
  const today = todayJalali();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState({ year: today.jy, month: today.jm, day: today.jd });

  function openCreate() {
    setEditing(null);
    setDescription("");
    setDate({ year: today.jy, month: today.jm, day: today.jd });
    setModalOpen(true);
  }

  function openEdit(row: EventItem) {
    setEditing(row);
    setDescription(row.description);
    setDate({ year: today.jy, month: row.jalaliMonth, day: row.jalaliDay });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { description, jalaliMonth: date.month, jalaliDay: date.day };
      if (editing) return updateEvent(editing.id, input);
      return createEvent(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setModalOpen(false);
      showMessages(["ثبت شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showMessages(["حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">مناسبت‌ها</Text>

      <RecordTable<EventItem>
        title="مناسبت‌ها"
        tableKey="events"
        pageContext="/monasebat"
        rows={eventsQuery.data?.events ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز مناسبتی ثبت نکردید"
        columns={[
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description}</Text> },
          { key: "jalaliMonth", defaultLabel: "ماه", render: (row) => <Text>{JALALI_MONTH_NAMES[row.jalaliMonth - 1]}</Text> },
          { key: "jalaliDay", defaultLabel: "روز", render: (row) => <Text>{row.jalaliDay}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش مناسبت" : "افزودن مناسبت"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <JalaliDateFields year={date.year} month={date.month} day={date.day} onChange={setDate} showYear={false} />
      </FormModal>
    </ScrollView>
  );
}
