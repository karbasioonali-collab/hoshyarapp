import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryBranch, formatTomanPhrase, JALALI_MONTH_NAMES, todayJalali } from "@hoshyar/shared";
import { createCategory, listCategories } from "@/api/categories";
import { fetchBranchChart, fetchCategoryChart } from "@/api/charts";
import { listBankAccounts } from "@/api/bankAccounts";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction } from "@/api/transactions";
import type { Transaction } from "@/api/types";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/ui/BarChart";
import { BoxGrid } from "@/components/ui/BoxGrid";
import { VoiceMicButton } from "@/components/ui/VoiceMicButton";
import { RecordTable } from "@/components/ui/RecordTable";
import { FormModal } from "@/components/ui/FormModal";
import { TextField } from "@/components/ui/TextField";
import { Dropdown } from "@/components/ui/Dropdown";
import { JalaliDateFields } from "@/components/ui/JalaliPickers";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import { useToast } from "@/components/ui/ToastProvider";

interface CategoryDetailProps {
  branch: CategoryBranch;
  categoryId: string;
  fallbackName: string;
  basePath: string;
  pageContext: string;
}

const MONTHS_BY_RANGE_KEY: Record<string, number | null> = { "1m": 1, "3m": 3, "6m": 6, "12m": 12, all: 60 };

export function CategoryDetail({ branch, categoryId, fallbackName, basePath, pageContext }: CategoryDetailProps) {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();

  const childrenQuery = useQuery({
    queryKey: ["categories", branch, categoryId],
    queryFn: () => listCategories(branch, categoryId),
  });

  if (childrenQuery.isLoading) {
    return (
      <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56 }}>
        <HomeButton />
      </ScrollView>
    );
  }

  const children = childrenQuery.data?.categories ?? [];
  if (children.length > 0) {
    return (
      <ParentCategoryView
        branch={branch}
        categoryId={categoryId}
        title={fallbackName}
        basePath={basePath}
        pageContext={pageContext}
        children_={children.map((c) => ({ id: c.id, label: c.name }))}
      />
    );
  }
  return <LeafCategoryView categoryId={categoryId} title={fallbackName} pageContext={pageContext} />;
}

function ParentCategoryView({
  branch,
  categoryId,
  title,
  basePath,
  pageContext,
  children_,
}: {
  branch: CategoryBranch;
  categoryId: string;
  title: string;
  basePath: string;
  pageContext: string;
  children_: { id: string; label: string }[];
}) {
  const queryClient = useQueryClient();
  const { showError } = useToast();
  const chartQuery = useQuery({
    queryKey: ["charts", "branch", branch, categoryId],
    queryFn: () => fetchBranchChart(branch, 3, categoryId),
  });
  const addChildMutation = useMutation({
    mutationFn: (name: string) => createCategory({ branch, parentId: categoryId, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories", branch, categoryId] }),
    onError: (error) => showError(error instanceof Error ? error.message : "افزودن دسته انجام نشد"),
  });
  const chartData = (chartQuery.data?.items ?? []).map((i) => ({ label: i.name, value: i.total }));

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="flex-row-reverse items-center justify-between mb-4">
        <HomeButton />
        <VoiceMicButton pageContext={pageContext} size={38} />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">{title}</Text>
      <Card className="mb-5">
        <Text className="text-navy font-semibold mb-3 text-right">مقایسه‌ی زیرشاخه‌های {title}</Text>
        <BarChart data={chartData} />
      </Card>
      <BoxGrid
        items={children_}
        onPressItem={(item) =>
          router.push({ pathname: `${basePath}/[categoryId]`, params: { categoryId: item.id, name: item.label } })
        }
        onAddNew={(name) => addChildMutation.mutate(name)}
      />
    </ScrollView>
  );
}

function LeafCategoryView({ categoryId, title, pageContext }: { categoryId: string; title: string; pageContext: string }) {
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();
  const [rangeKey, setRangeKey] = useState<"1m" | "3m" | "6m" | "12m" | "all">("6m");
  const months = MONTHS_BY_RANGE_KEY[rangeKey] ?? 6;

  const trendQuery = useQuery({
    queryKey: ["charts", "category", categoryId, months],
    queryFn: () => fetchCategoryChart(categoryId, months ?? 60),
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions", categoryId, months],
    queryFn: () => listTransactions({ categoryId, months: months ?? undefined }),
  });
  const bankAccountsQuery = useQuery({ queryKey: ["bank-accounts"], queryFn: listBankAccounts });

  const trendData = (trendQuery.data?.points ?? []).map((p) => ({
    label: JALALI_MONTH_NAMES[p.jm - 1],
    value: p.total,
  }));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [bankAccountId, setBankAccountId] = useState<string>("");
  const today = todayJalali();
  const [date, setDate] = useState({ year: today.jy, month: today.jm, day: today.jd });

  function openCreate() {
    setEditing(null);
    setAmount("");
    setDescription("");
    setBankAccountId(bankAccountsQuery.data?.accounts[0]?.id ?? "");
    setDate({ year: today.jy, month: today.jm, day: today.jd });
    setModalOpen(true);
  }

  function openEdit(row: Transaction) {
    setEditing(row);
    setAmount(row.amount);
    setDescription(row.description ?? "");
    setBankAccountId(row.bankAccountId ?? "");
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const input = {
        categoryId,
        bankAccountId: bankAccountId || null,
        amount: Number(amount),
        occurredOnJalali: `${date.year}-${date.month}-${date.day}`,
        description: description || undefined,
      };
      if (editing) return updateTransaction(editing.id, input);
      return createTransaction(input);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      setModalOpen(false);
      showMessages(["ثبت شد", ...result.events.map((e) => e.message)]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "ثبت انجام نشد"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      showMessages(["حذف شد", ...result.events.map((e) => e.message)]);
    },
    onError: (error) => showError(error instanceof Error ? error.message : "حذف انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="flex-row-reverse items-center justify-between mb-4">
        <HomeButton />
        <VoiceMicButton pageContext={pageContext} size={38} />
      </View>
      <Text className="text-navy text-xl font-bold mb-3 text-right">{title}</Text>

      <View className="mb-4">
        <TimeRangeSelector value={rangeKey} onChange={(v) => setRangeKey(v as typeof rangeKey)} />
      </View>

      <Card className="mb-5">
        <Text className="text-navy font-semibold mb-3 text-right">روند {title} در ماه‌های اخیر</Text>
        <BarChart data={trendData} />
      </Card>

      <RecordTable
        title={`تراکنش‌های ${title}`}
        tableKey="transactions"
        pageContext={pageContext}
        rows={transactionsQuery.data?.transactions ?? []}
        onAddPress={openCreate}
        onEdit={openEdit}
        onDelete={(row) => deleteMutation.mutate(row.id)}
        columns={[
          { key: "amount", defaultLabel: "مبلغ", render: (row) => <Text>{formatTomanPhrase(Number(row.amount))}</Text> },
          {
            key: "occurredOn",
            defaultLabel: "تاریخ",
            render: (row) => <Text>{new Date(row.occurredOn).toLocaleDateString("fa-IR")}</Text>,
          },
          { key: "description", defaultLabel: "شرح", render: (row) => <Text>{row.description ?? "-"}</Text> },
        ]}
      />

      <FormModal
        visible={modalOpen}
        title={editing ? "ویرایش تراکنش" : "افزودن تراکنش"}
        onClose={() => setModalOpen(false)}
        onSubmit={() => saveMutation.mutate()}
        submitting={saveMutation.isPending}
      >
        <TextField label="مبلغ (تومان)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        {(bankAccountsQuery.data?.accounts.length ?? 0) > 0 && (
          <Dropdown
            label="حساب بانکی"
            value={bankAccountId}
            onChange={setBankAccountId}
            options={[{ label: "بدون حساب", value: "" }, ...(bankAccountsQuery.data?.accounts ?? []).map((a) => ({ label: a.name, value: a.id }))]}
          />
        )}
        <JalaliDateFields year={date.year} month={date.month} day={date.day} onChange={setDate} />
        <TextField label="شرح" value={description} onChangeText={setDescription} />
      </FormModal>
    </ScrollView>
  );
}
