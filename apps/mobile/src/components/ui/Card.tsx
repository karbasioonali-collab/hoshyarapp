import React from "react";
import { View, ViewProps } from "react-native";

export function Card({ className = "", ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-white rounded-card p-4 shadow-sm ${className}`}
      style={{ shadowColor: "#0a1a3f", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
      {...props}
    />
  );
}
