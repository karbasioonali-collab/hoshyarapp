import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTomanPhrase, JALALI_MONTH_NAMES, PersonDirection } from "@hoshyar/shared";
import {
  createPersonLedgerEntry,
  deletePersonLedgerEntry,
  listPersonLedgerEntries,
  settlePersonLedgerEntry,
  updatePersonLedgerEntry,
} from "@/api/personLedger";
import { listBankAccounts } from "@/api/bankAccounts";
import type { PersonLedgerEntry } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/ToastProvider";

interface PersonLedgerScreenProps {
  direction: PersonDirection;
  title: string;
  pageContext: string;
  tableKey: string;
  monthColumnLabel: string;
  dayColumnLabel: string;
}

export function PersonLedgerScreen({ direction, title, pageContext, tableKey, monthColumnLabel, dayColumnLabel }: PersonLedgerScreenProps) {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const entriesQuery = useQuery({ queryKey: ["person-ledger", direction], queryFn: () => listPersonLedgerEntries(direction) });
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: listBankAccounts });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonLedgerEntry | null>(null);
  const [description, setDescription] = useState("");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueMonth, setDueMonth] = useState("1");
  const [dueDay, setDueDay] = useState("1");
  const [bankAccountId, setBankAccountId] = useState("");

  function openCreate() {
    setEditing(null);
    setDescription("");
    setPersonName("");
    setAmount("");
    setDueMonth("1");
    setDueDay("1");
    setBankAccountId("");
    setModalOpen(true);
  }

  function openEdit(row: PersonLedgerEntry) {
    setEditing(row);
    setDescription(row.description);
    setPersonName(row.personName);
    setAmount(row.amount);
    setDueMonth(String(row.dueMonth));
    setDueDay(String(row.dueDay));
    setBankAccountId(row.bankAccountId ?? "");
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        direction,
        description,
        personName,
        amount: Number(amount),
        dueMonth: Number(dueMonth),
        dueDay: Number(dueDay),
        bankAccountId: bankAccountId || null,
      };
      if (editing) return updatePersonLedgerEntry(editing.id, input);
      return createPersonLedgerEntry(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-ledger", direction] });
      setModalOpen(false);
      showMessages(["ثبت شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePersonLedgerEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person-ledger", direction] });
      showMessages(["حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  const settleMutation = useMutation({
    mutationFn: (id: string) => settlePersonLedgerEntry(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      showMessages(result.events.map((e) => e.message));
    },
    onError: (error) => showError(error instanceof Error ? error.message : "تسویه انجام نشد"),
  });

  const monthOptions = JALALI_MONTH_NAMES.map((name, i) => ({ label: name, value: i + 1 }));
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">{title}</Text>

      <RecordTable<PersonLedgerEntry>
        title={title}
        tableKey={tableKey}
        pageContext={pageContext}
        rows={(entriesQuery.data?.entries ?? []).filter((e) => e.status === "PENDING")}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        renderExtraAction={(row) => (
          <Pressable onPress={() => settleMutation.mutate(row.id)}>
            <Text className="text-[11px] text-turquoise-dark">تسویه</Text>
          </Pressable>
        )}
        columns={[
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description}</Text> },
          { key: "personName", defaultLabel: "نام", render: (row) => <Text>{row.personName}</Text> },
          { key: "amount", defaultLabel: "مبلغ", render: (row) => <Text>{formatTomanPhrase(Number(row.amount))}</Text> },
          { key: "dueMonth", defaultLabel: monthColumnLabel, render: (row) => <Text>{JALALI_MONTH_NAMES[row.dueMonth - 1]}</Text> },
          { key: "dueDay", defaultLabel: dayColumnLabel, render: (row) => <Text>{row.dueDay}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش" : "افزودن"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <TextField label="نام" value={personName} onChangeText={setPersonName} />
        <TextField label="مبلغ (تومان)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <Dropdown label={monthColumnLabel} value={dueMonth} options={monthOptions} onChange={setDueMonth} />
        <Dropdown label={dayColumnLabel} value={dueDay} options={dayOptions} onChange={setDueDay} />
        {(bankAccountsQuery.data?.accounts.length ?? 0) > 0 && (
          <Dropdown
            label="حساب بانکی"
            value={bankAccountId}
            onChange={setBankAccountId}
            options={[{ label: "بدون حساب", value: "" }, ...(bankAccountsQuery.data?.accounts ?? []).map((a) => ({ label: a.name, value: a.id }))]}
          />
        )}
      </FormModal>
    </ScrollView>
  );
}
