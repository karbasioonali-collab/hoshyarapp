import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function IndexRoute() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!hasHydrated) return null;
  if (!token) return <Redirect href="/login" />;
  if (!user?.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/home" />;
}
