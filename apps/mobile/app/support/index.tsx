import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";

export default function SupportScreen() {
  return (
    <ScrollView className="flex-1 bg-bg px-5" contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Text className="text-navy text-xl font-bold mb-4 text-right">پشتیبانی</Text>
      <Card>
        <Text className="text-navy text-right mb-3">
          هر سوال یا مشکلی داشتید، خوشحال می‌شیم کمکتون کنیم.
        </Text>
        <Pressable onPress={() => Linking.openURL("mailto:support@hoshyarapp.ir")}>
          <Text className="text-turquoise-dark text-right">support@hoshyarapp.ir</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}
