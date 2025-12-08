import type { Metadata, Viewport } from "next";
import "./globals.css";
import StyledComponentsRegistry from "./styles/StyledComponentsRegistry";
import { AppWrapper } from "./components";

export const metadata: Metadata = {
  title: "MoodTrip - 나만의 특별한 여행",
  description: "당신의 기분에 맞는 여행지를 추천해드립니다",
  icons: {
    icon: "/assets/icons/logo.svg",
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
        {/* Gmarket Sans - 울릉도 스타일 스토리용 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.css"
        />
        {/* 학교안심 산뜻바탕, 리코데오 - 한강공원/망리단길 스타일 스토리용 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-2@1.0/HakgyoansimSantteutbatangB.woff2"
        />
        {/* 나눔손글씨 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap"
        />
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
