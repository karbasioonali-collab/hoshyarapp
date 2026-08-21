import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAsset, deleteAsset, listAssets, updateAsset } from "@/api/assets";
import type { Asset } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function DaraeiScreen() {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const assetsQuery = useQuery({ queryKey: ["assets"], queryFn: listAssets });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("تومان");

  function openCreate() {
    setEditing(null);
    setDescription("");
    setAmount("");
    setUnit("تومان");
    setModalOpen(true);
  }

  function openEdit(row: Asset) {
    setEditing(row);
    setDescription(row.description);
    setAmount(row.amount);
    setUnit(row.unit);
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = { description, amount, unit };
      if (editing) return updateAsset(editing.id, input);
      return createAsset(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setModalOpen(false);
      showMessages(["ثبت شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      showMessages(["حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">دارایی‌ها</Text>

      <RecordTable<Asset>
        title="دارایی‌ها"
        tableKey="assets"
        pageContext="/hesab-o-ketab/daraei"
        rows={assetsQuery.data?.assets ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز دارایی‌ای ثبت نکردید"
        columns={[
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description}</Text> },
          { key: "amount", defaultLabel: "میزان", render: (row) => <Text>{row.amount} {row.unit}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش دارایی" : "افزودن دارایی"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <TextField label="میزان" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <TextField label="واحد (تومان، متر، گرم و ...)" value={unit} onChangeText={setUnit} />
      </FormModal>
    </ScrollView>
  );
}
