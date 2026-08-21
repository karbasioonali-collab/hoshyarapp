import React from "react";
import { Text, View } from "react-native";
import { formatTomanPhrase } from "@hoshyar/shared";
import { EmptyState } from "./EmptyState";

export interface BarChartDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  defaultColor?: string;
  height?: number;
}

/** نمودار ستونی ساده و بدون وابستگی خارجی (فقط View) - سبک و قابل‌اعتماد در RN */
export function BarChart({ data, defaultColor = "#14b8a6", height = 160 }: BarChartProps) {
  const hasValues = data.some((d) => d.value > 0);
  if (!hasValues) {
    return <EmptyState text="هنوز عددی برای این نمودار ثبت نشده، یه چیزی اضافه کنید" />;
  }
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="flex-row items-end justify-around" style={{ height: height + 40 }}>
      {data.map((datum) => {
        const barHeight = Math.max((datum.value / max) * height, datum.value > 0 ? 4 : 0);
        return (
          <View key={datum.label} className="items-center" style={{ width: `${100 / data.length}%` }}>
            <Text className="text-[10px] text-navy mb-1" numberOfLines={1}>
              {datum.value > 0 ? formatTomanPhrase(datum.value) : ""}
            </Text>
            <View
              style={{
                height: barHeight,
                width: "60%",
                backgroundColor: datum.color ?? defaultColor,
                borderRadius: 8,
              }}
            />
            <Text className="text-[11px] text-navy mt-1.5 text-center" numberOfLines={1}>
              {datum.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
