import { NextRequest, NextResponse } from "next/server";
import { requireUserId, withErrorHandling } from "@/lib/api-helpers";
import { payInstallmentPayment } from "@hoshyar/database";

// وقتی کاربر می‌گه «قسط رو دادم»: پرداخت‌شده علامت می‌خوره، از موجودی بانک و از
// کل بدهی باقی‌مونده (که از تجمیع قسط‌های پرداخت‌نشده محاسبه می‌شه) کم می‌شه
export const POST = withErrorHandling(async (request: NextRequest, { params }) => {
  const userId = await requireUserId(request);
  const { events } = await payInstallmentPayment(userId, params.id);
  return NextResponse.json({ ok: true, events });
});
