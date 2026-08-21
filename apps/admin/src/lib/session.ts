import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ADMIN_SESSION_COOKIE, signAdminToken, verifyAdminToken } from "./jwt";

export { verifyAdminToken, ADMIN_SESSION_COOKIE };

export async function createAdminSession(adminUserId: string) {
  const token = await signAdminToken(adminUserId);
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession() {
  cookies().delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminUserIdFromCookies(): Promise<string | null> {
  return verifyAdminToken(cookies().get(ADMIN_SESSION_COOKIE)?.value);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
