import { formatTomanPhrase, toGregorian, todayJalali } from "@hoshyar/shared";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { jy, jm } = todayJalali();
  const monthStart = toGregorian(jy, jm, 1);
  const nextMonth = jm === 12 ? { jy: jy + 1, jm: 1 } : { jy, jm: jm + 1 };
  const monthEnd = toGregorian(nextMonth.jy, nextMonth.jm, 1);

  const [userCount, transactionCount, incomeSum, expenseSum] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      where: { status: "PAID", occurredOn: { gte: monthStart, lt: monthEnd }, category: { branch: "INCOME" } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", occurredOn: { gte: monthStart, lt: monthEnd }, category: { branch: "EXPENSE" } },
      _sum: { amount: true },
    }),
  ]);

  const stats = [
    { label: "تعداد کاربران", value: userCount.toLocaleString("fa-IR") },
    { label: "تعداد کل تراکنش‌ها", value: transactionCount.toLocaleString("fa-IR") },
    { label: "درآمد کل کاربران (این ماه)", value: formatTomanPhrase(Number(incomeSum._sum.amount ?? 0)) },
    { label: "هزینه‌ی کل کاربران (این ماه)", value: formatTomanPhrase(Number(expenseSum._sum.amount ?? 0)) },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>داشبورد</h2>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="card" key={stat.label}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
