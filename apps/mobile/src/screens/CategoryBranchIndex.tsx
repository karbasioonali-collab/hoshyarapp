import React from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryBranch } from "@hoshyar/shared";
import { createCategory, listCategories } from "@/api/categories";
import { fetchBranchChart } from "@/api/charts";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/ui/BarChart";
import { BoxGrid } from "@/components/ui/BoxGrid";
import { VoiceMicButton } from "@/components/ui/VoiceMicButton";
import { useToast } from "@/components/ui/ToastProvider";

interface CategoryBranchIndexProps {
  branch: CategoryBranch;
  title: string;
  chartTitle: string;
  basePath: string;
  pageContext: string;
}

/** صفحه‌ی والد یک سرشاخه (مثلاً «درآمد» یا «هزینه‌های جاری»): باکس‌های زیرشاخه + نمودار مقایسه‌ای */
export function CategoryBranchIndex({ branch, title, chartTitle, basePath, pageContext }: CategoryBranchIndexProps) {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  const categoriesQuery = useQuery({
    queryKey: ["categories", branch, null],
    queryFn: () => listCategories(branch, null),
  });
  const chartQuery = useQuery({
    queryKey: ["charts", "branch", branch, null],
    queryFn: () => fetchBranchChart(branch, 3, null),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory({ branch, parentId: null, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories", branch, null] }),
    onError: (error) => showError(error instanceof Error ? error.message : "افزودن دسته انجام نشد"),
  });

  const items = (categoriesQuery.data?.categories ?? []).map((c) => ({ id: c.id, label: c.name }));
  const chartData = (chartQuery.data?.items ?? []).map((i) => ({ label: i.name, value: i.total }));

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="flex-row-reverse items-center justify-between mb-4">
        <HomeButton />
        <VoiceMicButton pageContext={pageContext} size={38} />
      </View>

      <Text className="text-navy text-xl font-bold mb-4 text-right">{title}</Text>

      <Card className="mb-5">
        <Text className="text-navy font-semibold mb-3 text-right">{chartTitle}</Text>
        <BarChart data={chartData} />
      </Card>

      <BoxGrid
        items={items}
        onPressItem={(item) => router.push({ pathname: `${basePath}/[categoryId]`, params: { categoryId: item.id, name: item.label } })}
        onAddNew={(name) => addCategoryMutation.mutate(name)}
      />
    </ScrollView>
  );
}
