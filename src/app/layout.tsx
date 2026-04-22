import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXAM 100 — AI 맞춤 시험 대비",
  description: "AI가 분석한 출제 가능성 높은 문제로 시험 100점에 도전하세요",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
