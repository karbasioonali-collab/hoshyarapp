import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim();
  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>کاربران</h2>
      <form className="card" style={{ marginBottom: 16 }}>
        <input name="q" placeholder="جستجو بر اساس نام، موبایل یا ایمیل" defaultValue={query} />
      </form>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>نام</th>
              <th>موبایل</th>
              <th>ایمیل</th>
              <th>onboarding</th>
              <th>تاریخ عضویت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name ?? "-"}</td>
                <td>{user.phone ?? "-"}</td>
                <td>{user.email ?? "-"}</td>
                <td>{user.onboardingCompleted ? "تکمیل شده" : "ناقص"}</td>
                <td>{user.createdAt.toLocaleDateString("fa-IR")}</td>
                <td>
                  <Link className="btn btn-primary" href={`/users/${user.id}`}>
                    جزئیات
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6}>کاربری پیدا نشد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
