import Link from "next/link";
import { formatTomanPhrase } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { adminDeleteTransactionAction } from "@/actions/transactions";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true, bankAccount: true, user: true },
    orderBy: { occurredOn: "desc" },
    take: 100,
  });

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>تراکنش‌ها (۱۰۰ مورد اخیر)</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>کاربر</th>
              <th>دسته</th>
              <th>مبلغ</th>
              <th>حساب</th>
              <th>تاریخ</th>
              <th>وضعیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <Link href={`/users/${tx.userId}`}>{tx.user.name ?? tx.user.phone ?? tx.user.email}</Link>
                </td>
                <td>{tx.category.name}</td>
                <td>{formatTomanPhrase(Number(tx.amount))}</td>
                <td>{tx.bankAccount?.name ?? "-"}</td>
                <td>{tx.occurredOn.toLocaleDateString("fa-IR")}</td>
                <td>{tx.status === "PAID" ? "پرداخت‌شده" : "در انتظار"}</td>
                <td>
                  <form action={adminDeleteTransactionAction}>
                    <input type="hidden" name="transactionId" value={tx.id} />
                    <input type="hidden" name="redirectPath" value="/transactions" />
                    <button className="btn btn-danger" type="submit">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7}>تراکنشی ثبت نشده</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
