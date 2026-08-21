import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { HomeButton } from "@/components/ui/HomeButton";
import { Card } from "@/components/ui/Card";

const ITEMS = [
  { label: "صفحه اصلی", href: "/home" },
  { label: "پروفایل", href: "/profile" },
  { label: "تنظیمات", href: "/settings" },
  { label: "پشتیبانی", href: "/support" },
] as const;

export default function MenuScreen() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-1 bg-bg px-5" style={{ paddingTop: 56 }}>
      <View className="mb-4">
        <HomeButton />
      </View>
      <Card>
        {ITEMS.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            className="py-3.5 border-b border-border"
          >
            <Text className="text-navy text-right">{item.label}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            logout();
            router.replace("/login");
          }}
          className="py-3.5"
        >
          <Text className="text-red-600 text-right">خروج از حساب</Text>
        </Pressable>
      </Card>
    </View>
  );
}
