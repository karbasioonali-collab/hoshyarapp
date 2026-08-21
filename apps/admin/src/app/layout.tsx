import "./globals.css";

export const metadata = {
  title: "پنل ادمین هوشیار",
  description: "مدیریت کاربران و تراکنش‌های هوشیار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
