import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { TIME_RANGE_PRESETS } from "@hoshyar/shared";
import { colors } from "@/theme/colors";

interface TimeRangeSelectorProps {
  value: (typeof TIME_RANGE_PRESETS)[number]["key"];
  onChange: (key: (typeof TIME_RANGE_PRESETS)[number]["key"]) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row-reverse">
      {TIME_RANGE_PRESETS.map((preset) => {
        const active = preset.key === value;
        return (
          <Pressable
            key={preset.key}
            onPress={() => onChange(preset.key)}
            className="rounded-full px-3 py-1.5 ml-2"
            style={{ backgroundColor: active ? colors.navy : "#fff", borderWidth: 1, borderColor: active ? colors.navy : "#e5eaf3" }}
          >
            <Text style={{ color: active ? "#fff" : colors.navy, fontSize: 12 }}>{preset.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
