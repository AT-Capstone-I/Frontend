import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodTrip - 스토리 카드 다운로드",
  description: "전시회에서 만든 나만의 여행 스토리 카드를 다운로드하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
