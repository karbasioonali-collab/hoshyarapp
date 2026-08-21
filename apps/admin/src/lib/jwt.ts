// این فایل فقط jose (edge-safe) استفاده می‌کنه، بدون bcrypt - چون middleware روی
// Edge Runtime اجرا می‌شه و بسته‌ی bcryptjs اونجا کار نمی‌کنه
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "hoshyar_admin_session";
const JWT_ALG = "HS256";
const JWT_EXPIRY = "7d";

function getSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET تنظیم نشده");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(adminUserId: string): Promise<string> {
  return new SignJWT({ sub: adminUserId })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
