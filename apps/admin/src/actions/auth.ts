"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { clearAdminSession, createAdminSession, verifyPassword } from "@/lib/session";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "ایمیل یا رمز عبور اشتباهه" };
  }

  await createAdminSession(admin.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  "use server";
  clearAdminSession();
  redirect("/login");
}
