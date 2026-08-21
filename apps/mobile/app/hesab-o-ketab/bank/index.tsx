import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTomanPhrase } from "@hoshyar/shared";
import { createBankAccount, deleteBankAccount, listBankAccounts, updateBankAccount } from "@/api/bankAccounts";
import type { BankAccount } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/ToastProvider";

export default function BankAccountsScreen() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["bank-accounts"], queryFn: listBankAccounts });
  const { showMessages, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [description, setDescription] = useState("");

  function openCreate() {
    setEditing(null);
    setName("");
    setBalance("");
    setDescription("");
    setModalOpen(true);
  }

  function openEdit(account: BankAccount) {
    setEditing(account);
    setName(account.name);
    setBalance(account.balance);
    setDescription(account.description ?? "");
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const input = { name, balance: balance ? Number(balance) : undefined, description };
      if (editing) return updateBankAccount(editing.id, input);
      return createBankAccount(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setModalOpen(false);
      showMessages(["حساب بانکی ذخیره شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ذخیره انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      showMessages(["حساب بانکی حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">بانک</Text>

      <RecordTable
        title="حساب‌های بانکی"
        tableKey="bankAccounts"
        pageContext="/hesab-o-ketab/bank"
        rows={data?.accounts ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز حساب بانکی ثبت نکردید"
        columns={[
          { key: "name", defaultLabel: "نام بانک", render: (row) => <Text>{row.name}</Text> },
          {
            key: "balance",
            defaultLabel: "موجودی",
            render: (row) => <Text>{formatTomanPhrase(Number(row.balance))}</Text>,
          },
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description ?? "-"}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش حساب بانکی" : "افزودن حساب بانکی"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="نام بانک" value={name} onChangeText={setName} />
        <TextField label="موجودی (تومان)" keyboardType="numeric" value={balance} onChangeText={setBalance} />
        <TextField label="شرح" value={description} onChangeText={setDescription} />
      </FormModal>
    </ScrollView>
  );
}
