import { api } from "./client";
import type { AuthUser } from "@/store/auth-store";

export function requestOtp(phone: string) {
  return api.post<{ ok: true; expiresInMinutes: number }>("/api/auth/otp/request", { phone });
}

export function verifyOtp(phone: string, code: string, name?: string) {
  return api.post<{ token: string; user: AuthUser }>("/api/auth/otp/verify", { phone, code, name });
}

export function registerWithEmail(email: string, password: string, name?: string) {
  return api.post<{ token: string; user: AuthUser }>("/api/auth/register", { email, password, name });
}

export function loginWithEmail(email: string, password: string) {
  return api.post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
}

export function fetchMe() {
  return api.get<{ user: AuthUser }>("/api/auth/me");
}

export function updateMe(input: { name?: string; settings?: Record<string, unknown> }) {
  return api.patch<{ user: AuthUser }>("/api/auth/me", input);
}
