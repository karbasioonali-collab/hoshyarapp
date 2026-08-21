import React from "react";
import { Platform, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/theme/colors";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

/** فیلد کشویی مشترک هوشیار - همه‌ی فیلدهای روز/ماه/ساعت از همین استفاده می‌کنن */
export function Dropdown({ label, value, onChange, options }: DropdownProps) {
  return (
    <View className="mb-3">
      {label && <Text className="text-xs text-navy mb-1 text-right">{label}</Text>}
      <View
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: colors.border }}
      >
        <Picker
          selectedValue={String(value)}
          onValueChange={(v) => onChange(String(v))}
          style={Platform.OS === "android" ? { color: colors.navy } : undefined}
          dropdownIconColor={colors.navy}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={String(option.value)} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
