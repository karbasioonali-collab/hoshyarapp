import React from "react";
import { Text, View } from "react-native";

export function EmptyState({ text = "هنوز اطلاعاتی ثبت نشده؛ یه چیزی اضافه کنید تا اینجا رو ببینید" }: { text?: string }) {
  return (
    <View className="items-center justify-center py-10 px-4">
      <Text className="text-textMuted text-center" style={{ color: "#94a3b8" }}>
        {text}
      </Text>
    </View>
  );
}
