export const metadata = {
  title: "هوشیار API",
  description: "بک‌اند دستیار مالی شخصی هوشیار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
