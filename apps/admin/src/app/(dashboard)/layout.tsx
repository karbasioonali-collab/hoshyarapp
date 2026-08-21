import { logoutAction } from "@/actions/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>هوشیار - پنل ادمین</h1>
        <nav>
          <a href="/dashboard">داشبورد</a>
          <a href="/users">کاربران</a>
          <a href="/transactions">تراکنش‌ها</a>
        </nav>
        <form action={logoutAction} style={{ marginTop: 24 }}>
          <button className="btn btn-danger" type="submit" style={{ width: "100%" }}>
            خروج
          </button>
        </form>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
