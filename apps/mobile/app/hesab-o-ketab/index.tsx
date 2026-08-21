import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BRANCH_COLORS, BRANCH_LABELS, CategoryBranch } from "@hoshyar/shared";
import { fetchSummaryChart } from "@/api/charts";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { BarChart } from "@/components/ui/BarChart";
import { VoiceMicButton } from "@/components/ui/VoiceMicButton";
import { colors } from "@/theme/colors";

const NAV_ITEMS: { key: string; label: string; href: string }[] = [
  { key: "bank", label: "بانک", href: "/hesab-o-ketab/bank" },
  { key: "daramad", label: "درآمد", href: "/hesab-o-ketab/daramad" },
  { key: "hazine", label: "هزینه‌های جاری", href: "/hesab-o-ketab/hazine" },
  { key: "aghsat", label: "اقساط", href: "/hesab-o-ketab/aghsat" },
  { key: "bedehi", label: "بدهی به اشخاص", href: "/hesab-o-ketab/bedehi" },
  { key: "talab", label: "طلب از اشخاص", href: "/hesab-o-ketab/talab" },
  { key: "daraei", label: "دارایی‌ها", href: "/hesab-o-ketab/daraei" },
];

const BRANCH_ORDER: CategoryBranch[] = ["INCOME", "INSTALLMENT", "EXPENSE", "RECEIVABLE", "DEBT", "ASSET"];

export default function HesabOKetabScreen() {
  const { data } = useQuery({ queryKey: ["charts", "summary"], queryFn: fetchSummaryChart });

  const chartData = BRANCH_ORDER.map((branch) => ({
    label: BRANCH_LABELS[branch],
    value: data?.branches[branch] ?? 0,
    color: BRANCH_COLORS[branch],
  }));

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="flex-row-reverse items-center justify-between mb-4">
        <HomeButton />
        <VoiceMicButton pageContext="/hesab-o-ketab" size={38} />
      </View>

      <Text className="text-navy text-xl font-bold mb-4 text-right">حساب و کتاب</Text>

      <Card className="mb-5">
        <Text className="text-navy font-semibold mb-3 text-right">درآمد این ماه در مقابل بقیه‌ی سرشاخه‌ها</Text>
        <BarChart data={chartData} />
      </Card>

      <View className="flex-row flex-wrap gap-3">
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.href as never)}
            className="basis-[31%] grow aspect-square rounded-card items-center justify-center bg-white shadow-sm border border-navy/5"
          >
            <Text className="text-navy text-center font-semibold text-xs px-1">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
