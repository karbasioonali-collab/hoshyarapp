import React from "react";
import { View } from "react-native";
import { JALALI_MONTH_NAMES, jalaaliMonthLength, todayJalali } from "@hoshyar/shared";
import { Dropdown } from "./Dropdown";

interface JalaliDateFieldsProps {
  year: number;
  month: number;
  day: number;
  onChange: (next: { year: number; month: number; day: number }) => void;
  showYear?: boolean;
}

/** سه فیلد کشویی سال/ماه/روز شمسی - طبق قانون سراسری، تاریخ همیشه شمسی و کشویی */
export function JalaliDateFields({ year, month, day, onChange, showYear = true }: JalaliDateFieldsProps) {
  const { jy: currentYear } = todayJalali();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - 1 + i).map((y) => ({
    label: String(y),
    value: y,
  }));
  const monthOptions = JALALI_MONTH_NAMES.map((name, i) => ({ label: name, value: i + 1 }));
  const dayCount = jalaaliMonthLength(year, month);
  const dayOptions = Array.from({ length: dayCount }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

  return (
    <View className="flex-row-reverse gap-2">
      {showYear && (
        <View className="flex-1">
          <Dropdown label="سال" value={year} options={yearOptions} onChange={(v) => onChange({ year: Number(v), month, day })} />
        </View>
      )}
      <View className="flex-1">
        <Dropdown
          label="ماه"
          value={month}
          options={monthOptions}
          onChange={(v) => onChange({ year, month: Number(v), day: Math.min(day, jalaaliMonthLength(year, Number(v))) })}
        />
      </View>
      <View className="flex-1">
        <Dropdown label="روز" value={day} options={dayOptions} onChange={(v) => onChange({ year, month, day: Number(v) })} />
      </View>
    </View>
  );
}

interface TimeFieldsProps {
  hour: number;
  minute: number;
  onChange: (next: { hour: number; minute: number }) => void;
}

/** ساعت همیشه ۲۴ساعته و کشویی */
export function TimeFields({ hour, minute, onChange }: TimeFieldsProps) {
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: i }));
  const minuteOptions = [0, 15, 30, 45].map((m) => ({ label: String(m).padStart(2, "0"), value: m }));

  return (
    <View className="flex-row-reverse gap-2">
      <View className="flex-1">
        <Dropdown label="ساعت" value={hour} options={hourOptions} onChange={(v) => onChange({ hour: Number(v), minute })} />
      </View>
      <View className="flex-1">
        <Dropdown label="دقیقه" value={minute} options={minuteOptions} onChange={(v) => onChange({ hour, minute: Number(v) })} />
      </View>
    </View>
  );
}
