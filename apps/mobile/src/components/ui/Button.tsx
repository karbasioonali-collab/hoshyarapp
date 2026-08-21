import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-navy",
  outline: "bg-white border border-navy/20",
  danger: "bg-red-50",
  ghost: "bg-transparent",
};

const VARIANT_TEXT_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "text-white",
  outline: "text-navy",
  danger: "text-red-600",
  ghost: "text-navy",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl px-4 py-3 items-center justify-center ${VARIANT_STYLES[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#0a1a3f"} />
      ) : (
        <Text className={`font-semibold ${VARIANT_TEXT_STYLES[variant]}`}>{title}</Text>
      )}
    </Pressable>
  );
}
