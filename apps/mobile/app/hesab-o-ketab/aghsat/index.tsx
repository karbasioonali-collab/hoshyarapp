import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTomanPhrase } from "@hoshyar/shared";
import { createInstallmentPlan, deleteInstallmentPlan, listInstallmentPlans } from "@/api/installments";
import { listBankAccounts } from "@/api/bankAccounts";
import type { InstallmentPlan } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/ToastProvider";

export default function AghsatScreen() {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const plansQuery = useQuery({ queryKey: ["installments"], queryFn: listInstallmentPlans });
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: listBankAccounts });

  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [monthsCount, setMonthsCount] = useState("");
  const [payDay, setPayDay] = useState("1");
  const [bankAccountId, setBankAccountId] = useState("");

  function openCreate() {
    setDescription("");
    setTotalAmount("");
    setMonthsCount("");
    setPayDay("1");
    setBankAccountId(bankAccountsQuery.data?.accounts[0]?.id ?? "");
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      createInstallmentPlan({
        description,
        totalAmount: Number(totalAmount),
        monthsCount: Number(monthsCount),
        payDay: Number(payDay),
        bankAccountId: bankAccountId || null,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      setModalOpen(false);
      showMessages(result.events.map((e) => e.message));
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت قسط انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInstallmentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      showMessages(["قسط حذف شد"]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  const dayOptions = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">اقساط</Text>

      <RecordTable<InstallmentPlan>
        title="اقساط"
        tableKey="installments"
        pageContext="/hesab-o-ketab/aghsat"
        rows={plansQuery.data?.plans ?? []}
        onAddPress={openCreate}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        emptyText="هنوز قسطی ثبت نکردید"
        columns={[
          {
            key: "description",
            defaultLabel: "شرح",
            render: (row) => (
              <Pressable onPress={() => router.push({ pathname: "/hesab-o-ketab/aghsat/[planId]", params: { planId: row.id } })}>
                <Text className="text-turquoise-dark">{row.description}</Text>
              </Pressable>
            ),
          },
          { key: "totalAmount", defaultLabel: "مبلغ کل قسط", render: (row) => <Text>{formatTomanPhrase(Number(row.totalAmount))}</Text> },
          { key: "monthlyAmount", defaultLabel: "قسط هر ماه", render: (row) => <Text>{formatTomanPhrase(Number(row.monthlyAmount))}</Text> },
          { key: "monthsCount", defaultLabel: "تعداد اقساط", render: (row) => <Text>{row.monthsCount}</Text> },
          { key: "payDay", defaultLabel: "روز پرداخت هر ماه", render: (row) => <Text>{row.payDay}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title="افزودن قسط"
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <TextField label="مبلغ کل قسط (تومان)" keyboardType="numeric" value={totalAmount} onChangeText={setTotalAmount} />
        <TextField label="تعداد اقساط (ماه)" keyboardType="numeric" value={monthsCount} onChangeText={setMonthsCount} />
        <Dropdown label="روز پرداخت هر ماه" value={payDay} options={dayOptions} onChange={setPayDay} />
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
