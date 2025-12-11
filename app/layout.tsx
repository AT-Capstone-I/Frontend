import type { Metadata, Viewport } from "next";
import "./globals.css";
import StyledComponentsRegistry from "./styles/StyledComponentsRegistry";
import { AppWrapper } from "./components";

export const metadata: Metadata = {
  title: "MoodTrip - 나만의 특별한 여행",
  description: "당신의 기분에 맞는 여행지를 추천해드립니다",
  icons: {
    icon: "/assets/icons/MoodTrip.png",
  },
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
        {/* Gmarket Sans - 로컬 폰트 사용 (globals.css에서 @font-face 정의) */}
        {/* 나눔손글씨 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap"
        />
        {/* Adobe Typekit - Inter Light (스토리 페이지용) */}
        <link rel="stylesheet" href="https://use.typekit.net/lmp4aup.css" />
        {/* Montserrat 폰트 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F9DE8" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <AppWrapper>
            {children}
          </AppWrapper>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
