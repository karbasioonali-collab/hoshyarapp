import { notFound } from "next/navigation";
import { formatTomanPhrase } from "@hoshyar/shared";
import { prisma } from "@/lib/db";
import { adminDeleteTransactionAction } from "@/actions/transactions";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  const [bankAccounts, transactions] = await Promise.all([
    prisma.bankAccount.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, bankAccount: true },
      orderBy: { occurredOn: "desc" },
      take: 50,
    }),
  ]);

  const redirectPath = `/users/${user.id}`;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{user.name ?? user.phone ?? user.email ?? "کاربر"}</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <p>موبایل: {user.phone ?? "-"}</p>
        <p>ایمیل: {user.email ?? "-"}</p>
        <p>onboarding: {user.onboardingCompleted ? "تکمیل شده" : "ناقص"}</p>
        <p>تاریخ عضویت: {user.createdAt.toLocaleString("fa-IR")}</p>
      </div>

      <h3 style={{ margin: "16px 0" }}>حساب‌های بانکی</h3>
      <div className="card" style={{ marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th>نام بانک</th>
              <th>موجودی</th>
              <th>شرح</th>
            </tr>
          </thead>
          <tbody>
            {bankAccounts.map((account) => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{formatTomanPhrase(Number(account.balance))}</td>
                <td>{account.description ?? "-"}</td>
              </tr>
            ))}
            {bankAccounts.length === 0 && (
              <tr>
                <td colSpan={3}>حساب بانکی ثبت نشده</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ margin: "16px 0" }}>آخرین تراکنش‌ها</h3>
      <div className="card">
        <table>
          <thead>
            <tr>
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
                <td>{tx.category.name}</td>
                <td>{formatTomanPhrase(Number(tx.amount))}</td>
                <td>{tx.bankAccount?.name ?? "-"}</td>
                <td>{tx.occurredOn.toLocaleDateString("fa-IR")}</td>
                <td>{tx.status === "PAID" ? "پرداخت‌شده" : "در انتظار"}</td>
                <td>
                  <form action={adminDeleteTransactionAction}>
                    <input type="hidden" name="transactionId" value={tx.id} />
                    <input type="hidden" name="redirectPath" value={redirectPath} />
                    <button className="btn btn-danger" type="submit">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6}>تراکنشی ثبت نشده</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
