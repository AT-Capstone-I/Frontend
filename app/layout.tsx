import type { Metadata, Viewport } from "next";
import "./globals.css";
import StyledComponentsRegistry from "./styles/StyledComponentsRegistry";

export const metadata: Metadata = {
  title: "MoodTrip - 나만의 특별한 여행",
  description: "당신의 기분에 맞는 여행지를 추천해드립니다",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
