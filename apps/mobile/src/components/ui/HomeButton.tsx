import React from "react";
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";

function HomeIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11.5L12 4l9 7.5M5.5 10v9a1 1 0 001 1h11a1 1 0 001-1v-9"
        stroke={colors.turquoiseDark}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** دکمه‌ی چشم‌گیر «بازگشت به صفحه اصلی» - طبق قانون سراسری، بالای هر صفحه */
export function HomeButton() {
  return (
    <Pressable
      onPress={() => router.push("/home")}
      className="flex-row items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 border border-turquoise-dark/30"
    >
      <HomeIcon />
      <Text className="text-navy text-xs font-medium">بازگشت به صفحه اصلی</Text>
    </Pressable>
  );
}
