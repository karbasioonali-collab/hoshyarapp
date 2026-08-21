import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/theme/colors";
import { FormLabel } from "./FormModal";

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View className="mb-3">
      {label && <FormLabel text={label} />}
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[
          {
            backgroundColor: "#f1f5f9",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
            textAlign: "right",
            writingDirection: "rtl",
            color: colors.navy,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
