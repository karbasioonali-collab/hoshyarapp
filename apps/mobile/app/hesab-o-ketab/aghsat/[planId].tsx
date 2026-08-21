import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTomanPhrase, JALALI_MONTH_NAMES } from "@hoshyar/shared";
import { getInstallmentPlan, payInstallment } from "@/api/installments";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/ToastProvider";

export default function InstallmentPlanDetail() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const queryClient = useQueryClient();
  const { showMessages, showError } = useToast();

  const { data } = useQuery({ queryKey: ["installments", planId], queryFn: () => getInstallmentPlan(planId) });
  const plan = data?.plan;

  const payMutation = useMutation({
    mutationFn: (paymentId: string) => payInstallment(paymentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries();
      showMessages(result.events.map((e) => e.message));
    },
    onError: (error) => showError(error instanceof Error ? error.message : "پرداخت انجام نشد"),
  });

  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      {plan && (
        <>
          <Text className="text-navy text-xl font-bold mb-1 text-right">{plan.description}</Text>
          <Text className="text-right mb-4" style={{ color: "#64748b" }}>
            {formatTomanPhrase(Number(plan.monthlyAmount))} در ماه · {plan.monthsCount} ماهه
          </Text>

          <Card>
            {plan.payments.map((payment) => (
              <View key={payment.id} className="flex-row-reverse items-center justify-between py-3 border-b border-border/60">
                <View>
                  <Text className="text-navy text-right">
                    قسط {payment.monthIndex} · {JALALI_MONTH_NAMES[payment.dueMonth - 1]} روز {payment.dueDay}
                  </Text>
                  <Text className="text-xs text-right" style={{ color: "#64748b" }}>
                    {formatTomanPhrase(Number(payment.amount))}
                  </Text>
                </View>
                {payment.paidAt ? (
                  <View className="flex-row items-center gap-1">
                    <CheckIcon />
                    <Text className="text-xs" style={{ color: "#16a34a" }}>
                      پرداخت‌شده
                    </Text>
                  </View>
                ) : (
                  <Pressable onPress={() => payMutation.mutate(payment.id)}>
                    <Text className="text-turquoise-dark text-xs">قسط رو دادم</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}
