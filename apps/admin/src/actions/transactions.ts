"use server";

import { revalidatePath } from "next/cache";
import { deleteTransaction } from "@hoshyar/database";
import { prisma } from "@/lib/db";

// حذف تراکنش از پنل ادمین هم دقیقاً از همون ledger-service مرکزی رد می‌شه، همون‌طور که
// از اپ موبایل رد می‌شه - تا هیچ‌وقت موجودی بانک کاربر ناهماهنگ نشه
export async function adminDeleteTransactionAction(formData: FormData) {
  const transactionId = String(formData.get("transactionId"));
  const redirectPath = String(formData.get("redirectPath") ?? "/transactions");

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (transaction) {
    await deleteTransaction(transaction.userId, transactionId);
  }
  revalidatePath(redirectPath);
}
