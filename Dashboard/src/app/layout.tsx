import type { Metadata } from "next";
// استخدام خط عربي حديث ومناسب للواجهات الطبية
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusClinic OS | نظام عيادة نيكسوس",
  description: "نظام إدارة وتنسيق المواعيد الطبية عالي الدقة (نسخة العراق)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
