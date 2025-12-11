"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styled, { keyframes, css } from "styled-components";
// @ts-ignore - html-to-image 타입 정의 없음
import * as htmlToImage from "html-to-image";
import { getStoryCard, StoryCardResponse } from "@/app/lib/api";

// 폰트를 Base64로 변환하는 유틸리티
const fontToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
};

// ============ Story 데이터 인터페이스 ============
interface StoryInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  images: string[]; // 이미지 배열
  date: string;
  dayOfWeek: string;
  subtitle: string;
  detailDescription: string;
  isDarkBackground: boolean;
}

// ============ 애니메이션 ============
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`;

const contentFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ============ Styled Components ============
const StoryWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background-color: #f7f7f7;
  overflow: hidden;
`;

// 캡처 영역 - 배경 + 콘텐츠만 포함
const CaptureArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 101px;
  overflow: hidden;
`;

const BackgroundImage = styled.div<{ $imageUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1a1a2e;
  background-image: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl})` : "none"};
  background-size: cover;
  background-position: center;
  z-index: 0;

  /* 어두운 그라데이션 오버레이 (흰색 글씨 가독성) */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.1) 30%,
      rgba(0, 0, 0, 0.1) 70%,
      rgba(0, 0, 0, 0.3) 100%
    );
    pointer-events: none;
  }
`;

const ClickArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 101px; /* 하단 네비게이션 영역 제외 */
  z-index: 15;
  cursor: pointer;
`;

// 이미지 인디케이터 (스와이프 안내)
const ImageIndicator = styled.div`
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 20;
`;

const IndicatorDot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background-color: ${({ $active }) =>
    $active ? "#ffffff" : "rgba(255, 255, 255, 0.4)"};
  transition: background-color 0.2s ease, transform 0.2s ease;

  ${({ $active }) =>
    $active &&
    `
    transform: scale(1.2);
  `}
`;

// 로딩/에러 상태 컴포넌트
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 20px;
`;

const ErrorText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  color: #ffffff;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// 상단 컨트롤 바
const TopControlBar = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 54px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    transparent 100%
  );

  ${({ $visible }) =>
    $visible
      ? css`
          animation: ${fadeIn} 0.3s ease-out forwards;
        `
      : css`
          animation: ${fadeOut} 0.3s ease-out forwards;
          pointer-events: none;
        `}
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: 12px;
`;

// 레이아웃 1: 울릉도 스타일 - 중앙 정렬 (Gmarket Sans Bold)
const Layout1Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  z-index: 1;
  pointer-events: none;
`;

const Layout1TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Layout1KoreanTitle = styled.h1`
  font-family: "GmarketSans", sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout1EnglishTitle = styled.h2`
  font-family: "GmarketSans", sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const VerticalDivider = styled.div`
  width: 2px;
  height: 48px;
  background-color: #ffffff;
`;

const Layout1Description = styled.div`
  font-family: "GmarketSans", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: right;
  white-space: pre-line;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 레이아웃 2: 한강 공원 스타일 - 좌측 상단, 어두운 그라데이션 (Hakgyoansim Santteutbatang M, Hakgyoansim RikodeoOTF R)
const Layout2GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 50%
  );
  z-index: 1;
  pointer-events: none;
`;

const Layout2Content = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  padding: 40px;
  z-index: 2;
  pointer-events: none;
`;

const Layout2DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
`;

const Layout2Date = styled.span`
  font-family: "Hakgyoansim Santteutbatang", "HakgyoansimSantteutbatang", serif;
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const HorizontalDivider = styled.div`
  width: 1px;
  height: 15px;
  background-color: #ffffff;
`;

const Layout2DayOfWeek = styled.span`
  font-family: "Hakgyoansim Santteutbatang", "HakgyoansimSantteutbatang", serif;
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout2TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Layout2Subtitle = styled.p`
  font-family: "Hakgyoansim Santteutbatang", "HakgyoansimSantteutbatang", serif;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout2Title = styled.h1`
  font-family: "Hakgyoansim Rikodeo", "HakgyoansimRikodeo", serif;
  font-size: 40px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 레이아웃 3: 망리단길 스타일 - 하단, 어두운 그라데이션 (Hakgyoansim RikodeoOTF R, KOHINanumOTF Light)
const Layout3GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 44.45%,
    rgba(0, 0, 0, 0.7) 80.37%
  );
  z-index: 1;
  pointer-events: none;
`;

const Layout3Content = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  pointer-events: none;
`;

const Layout3Title = styled.h1`
  font-family: "Hakgyoansim Rikodeo", "HakgyoansimRikodeo", serif;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  margin-bottom: 4px;
`;

const Layout3Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #ffffff;
`;

const Layout3Description = styled.p`
  font-family: "KOHINanum", sans-serif;
  font-weight: 300;
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.6px;
  color: #ffffff;
  white-space: pre-line;
  margin-top: 4px;
`;

// 레이아웃 4: 로고만 표시 - 배경에 따라 색상 변경
const Layout4Content = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const Layout4Logo = styled.img<{ $isDark: boolean }>`
  height: 24px;
  width: auto;
  filter: ${({ $isDark }) => ($isDark ? "brightness(0) invert(1)" : "none")};
  ${({ $isDark }) => $isDark && "drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);"}
`;

// 레이아웃 5: 상세 설명 - 중앙 하단
const Layout5GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  z-index: 1;
  pointer-events: none;
`;

const Layout5Content = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  pointer-events: none;
`;

const Layout5Title = styled.h1`
  font-family: "GmarketSans", sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout5Description = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: -0.3px;
  color: #ffffff;
  text-align: center;
  white-space: pre-line;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

// 레이아웃 6: 중앙 로고 + 브랜드 슬로건 디자인
const Layout6Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(79, 157, 232, 0.85) 0%,
    rgba(102, 178, 254, 0.75) 50%,
    rgba(79, 157, 232, 0.85) 100%
  );
  z-index: 1;
  pointer-events: none;
`;

const Layout6Content = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  z-index: 2;
  pointer-events: none;
`;

const Layout6LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Layout6Logo = styled.img`
  height: 48px;
  width: auto;
  filter: brightness(0) invert(1);
`;

const Layout6Divider = styled.div`
  width: 40px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.6);
`;

const Layout6Slogan = styled.p`
  font-family: "GmarketSans", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.3px;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  white-space: pre-line;
`;

const Layout6Footer = styled.p`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  position: absolute;
  bottom: 30px;
`;

// 하단 네비게이션
const BottomNavigation = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 12px 20px 34px;
  z-index: 10;
`;

const PageButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const PageButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 43px;
  border-radius: 12px;
  border: ${({ $active }) => ($active ? "none" : "1px solid #c4c2c6")};
  background-color: ${({ $active }) => ($active ? "#66b2fe" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#aaa8ad")};
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#66b2fe" : "#f5f5f5")};
  }
`;

const AnimatedContent = styled.div`
  animation: ${contentFadeIn} 0.4s ease-out;
`;

// ============ 아이콘 컴포넌트 ============
const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ============ 레이아웃 컴포넌트들 ============
interface LayoutProps {
  storyInfo: StoryInfo;
}

const Layout1 = ({ storyInfo }: LayoutProps) => (
  <Layout1Overlay>
    <AnimatedContent>
      <Layout1TitleContainer>
        <Layout1KoreanTitle>{storyInfo.name}</Layout1KoreanTitle>
        <Layout1EnglishTitle>{storyInfo.nameEn}</Layout1EnglishTitle>
      </Layout1TitleContainer>
      {/* 세로선과 설명 - 영문 제목과의 간격을 위해 margin-top 추가 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <VerticalDivider />
        <Layout1Description>{storyInfo.description}</Layout1Description>
      </div>
    </AnimatedContent>
  </Layout1Overlay>
);

const Layout2 = ({ storyInfo }: LayoutProps) => (
  <>
    <Layout2GradientOverlay />
    <Layout2Content>
      <AnimatedContent>
        <Layout2DateRow>
          <Layout2Date>{storyInfo.date}</Layout2Date>
          <HorizontalDivider />
          <Layout2DayOfWeek>{storyInfo.dayOfWeek}</Layout2DayOfWeek>
        </Layout2DateRow>
        <Layout2TextContainer>
          <Layout2Subtitle>{storyInfo.subtitle}</Layout2Subtitle>
          <Layout2Title>{storyInfo.name}</Layout2Title>
        </Layout2TextContainer>
      </AnimatedContent>
    </Layout2Content>
  </>
);

const Layout3 = ({ storyInfo }: LayoutProps) => (
  <>
    <Layout3GradientOverlay />
    <Layout3Content>
      <AnimatedContent>
        <Layout3Title>{storyInfo.name}</Layout3Title>
        <Layout3Divider />
        <Layout3Description>{storyInfo.description}</Layout3Description>
      </AnimatedContent>
    </Layout3Content>
  </>
);

const Layout4 = ({ storyInfo }: LayoutProps) => (
  <Layout4Content>
    <AnimatedContent>
      <Layout4Logo
        src="/assets/icons/icon.svg"
        alt="MoodTrip"
        $isDark={storyInfo.isDarkBackground}
      />
    </AnimatedContent>
  </Layout4Content>
);

const Layout5 = ({ storyInfo }: LayoutProps) => (
  <>
    <Layout5GradientOverlay />
    <Layout5Content>
      <AnimatedContent>
        <Layout5Title>{storyInfo.name}</Layout5Title>
        <Layout5Description>{storyInfo.detailDescription}</Layout5Description>
      </AnimatedContent>
    </Layout5Content>
  </>
);

const Layout6 = () => (
  <>
    <Layout6Overlay />
    <Layout6Content>
      <AnimatedContent
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
        }}
      >
        <Layout6LogoContainer>
          <Layout6Logo src="/assets/icons/icon.svg" alt="MoodTrip" />
        </Layout6LogoContainer>
        <Layout6Divider />
        <Layout6Slogan>{`나만의 감성으로 떠나는\n특별한 여행의 시작`}</Layout6Slogan>
      </AnimatedContent>
      <Layout6Footer>© 2025 MoodTrip. All rights reserved.</Layout6Footer>
    </Layout6Content>
  </>
);

// ============ 메인 컴포넌트 ============
export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const captureRef = useRef<HTMLDivElement>(null);

  const [currentLayout, setCurrentLayout] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 이미지 인덱스 (스와이프용)
  const [storyInfo, setStoryInfo] = useState<StoryInfo | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 스와이프 제스처 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50; // 최소 스와이프 거리

  // 날짜 포맷 헬퍼 함수
  const formatDateForDisplay = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}.${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  const getDayOfWeek = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Story Card API 호출
  useEffect(() => {
    const fetchStoryCard = async () => {
      if (!tripId) return;

      try {
        setIsLoading(true);
        setError(null);

        const card = await getStoryCard(tripId, {
          shuffle: true,
          limit: 6, // 6개 레이아웃용 이미지
        });

        console.log("📸 Story Card API 응답:", card);
        console.log("📸 이미지 배열:", card.images);
        console.log("📸 이미지 개수:", card.image_count);

        // 이미지 배열이 비어있으면 기본 이미지 사용
        let images = card.images || [];
        if (images.length === 0 && card.image_count > 0) {
          // API에서 이미지 URL이 안 왔지만 이미지가 있다고 했을 때
          // 도시명 기반으로 이미지 URL 생성 시도
          console.log("⚠️ 이미지 배열이 비어있어 기본 이미지 사용");
        }

        // API 응답을 StoryInfo로 변환
        setStoryInfo({
          id: card.trip_id,
          name: card.city,
          nameEn: card.city_en || card.city,
          description: card.theme_phrase || "특별한 여행이 시작됩니다",
          images: images,
          date: formatDateForDisplay(card.start_date),
          dayOfWeek: getDayOfWeek(card.start_date),
          subtitle: "너의 취향 그대로, 맞춤 여행 시작",
          detailDescription:
            card.summary || card.theme_phrase || "새로운 추억을 만들어보세요",
          isDarkBackground: true,
        });
      } catch (err) {
        console.error("Story card fetch error:", err);
        setError("스토리 카드를 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoryCard();
  }, [tripId]);

  // 현재 선택된 배경 이미지 (스와이프로 변경)
  const getCurrentBackgroundImage = useCallback((): string => {
    if (!storyInfo?.images?.length) {
      console.log("❌ 이미지 배열이 비어있음");
      return "";
    }
    const imageUrl = storyInfo.images[currentImageIndex];
    return imageUrl;
  }, [storyInfo, currentImageIndex]);

  // 이전 이미지
  const handlePrevImage = useCallback(() => {
    if (!storyInfo?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? storyInfo.images.length - 1 : prev - 1
    );
  }, [storyInfo]);

  // 다음 이미지
  const handleNextImage = useCallback(() => {
    if (!storyInfo?.images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === storyInfo.images.length - 1 ? 0 : prev + 1
    );
  }, [storyInfo]);

  // 스와이프 시작
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  // 스와이프 이동
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  // 스와이프 종료
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  }, [touchStart, touchEnd, handleNextImage, handlePrevImage]);

  // 레이아웃별 배경 이미지 (캡처용 - 현재 이미지 사용)
  const getBackgroundForLayout = useCallback((): string => {
    return getCurrentBackgroundImage();
  }, [getCurrentBackgroundImage]);

  const handleImageClick = useCallback(() => {
    setHasInteracted(true);
    setShowControls((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 화면 캡처 함수
  const captureStory = useCallback(async (): Promise<Blob | null> => {
    if (!captureRef.current || !storyInfo) return null;

    setIsCapturing(true);

    try {
      // 폰트 로딩 대기 (충분한 시간)
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 배경 이미지 로딩 대기
      const bgImage = getBackgroundForLayout();
      if (bgImage) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = bgImage;
        });
      }

      // 폰트 로딩 대기
      await document.fonts.ready;

      // 로컬 폰트를 Base64로 임베드
      const [fontLight, fontMedium, fontBold] = await Promise.all([
        fontToBase64("/fonts/GmarketSansLight.otf"),
        fontToBase64("/fonts/GmarketSansMedium.otf"),
        fontToBase64("/fonts/GmarketSansBold.otf"),
      ]);

      // Base64 폰트가 로드되었으면 @font-face 생성
      const fontEmbedCSS = fontBold
        ? `
        @font-face {
          font-family: 'GmarketSans';
          src: url(${fontLight}) format('opentype');
          font-weight: 300;
          font-style: normal;
        }
        @font-face {
          font-family: 'GmarketSans';
          src: url(${fontMedium}) format('opentype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'GmarketSans';
          src: url(${fontBold}) format('opentype');
          font-weight: 700;
          font-style: normal;
        }
      `
        : "";

      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: true, // CORS 에러 방지
        includeQueryParams: true,
        backgroundColor: "#1a1a2e",
        fontEmbedCSS,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        filter: (node: Node) => {
          if (
            node instanceof HTMLElement &&
            node.dataset.captureIgnore === "true"
          ) {
            return false;
          }
          return true;
        },
      });

      // dataUrl을 Blob으로 변환
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      return blob;
    } catch (error) {
      console.error("캡처 실패:", error);

      // 폴백: 폰트 스킵하고 재시도
      try {
        const dataUrl = await htmlToImage.toPng(captureRef.current!, {
          quality: 1,
          pixelRatio: 2,
          skipFonts: true,
          cacheBust: true,
          filter: (node: Node) => {
            if (
              node instanceof HTMLElement &&
              node.dataset.captureIgnore === "true"
            ) {
              return false;
            }
            return true;
          },
        });
        const response = await fetch(dataUrl);
        return await response.blob();
      } catch (fallbackError) {
        console.error("폴백 캡처도 실패:", fallbackError);
        return null;
      }
    } finally {
      setIsCapturing(false);
    }
  }, [storyInfo, getBackgroundForLayout]);

  const handleDownload = useCallback(async () => {
    if (!storyInfo) return;

    const blob = await captureStory();
    if (!blob) {
      alert("이미지 생성에 실패했습니다.");
      return;
    }

    // 다운로드
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moodtrip-${storyInfo.name}-${currentLayout}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [storyInfo, captureStory, currentLayout]);

  const handleShare = useCallback(async () => {
    if (!storyInfo) return;

    const blob = await captureStory();
    if (!blob) {
      alert("이미지 생성에 실패했습니다.");
      return;
    }

    const file = new File([blob], `moodtrip-${storyInfo.name}.png`, {
      type: "image/png",
    });

    // Web Share API로 이미지 공유
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: `MoodTrip - ${storyInfo.name}`,
          text: storyInfo.description.replace("\n", " "),
        });
      } catch (error) {
        console.log("공유 취소됨");
      }
    } else {
      // 공유 API가 지원되지 않으면 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moodtrip-${storyInfo.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("이미지가 다운로드되었습니다!");
    }
  }, [storyInfo, captureStory]);

  const handleLayoutChange = useCallback((layout: number) => {
    setCurrentLayout(layout);
  }, []);

  // 로딩 중
  if (isLoading) {
    return (
      <StoryWrapper>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>스토리를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </StoryWrapper>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <StoryWrapper>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={() => router.back()}>돌아가기</RetryButton>
        </ErrorContainer>
      </StoryWrapper>
    );
  }

  // 데이터 없음
  if (!storyInfo) {
    return null;
  }

  const renderLayout = () => {
    switch (currentLayout) {
      case 1:
        return <Layout1 storyInfo={storyInfo} />;
      case 2:
        return <Layout2 storyInfo={storyInfo} />;
      case 3:
        return <Layout3 storyInfo={storyInfo} />;
      case 4:
        return <Layout4 storyInfo={storyInfo} />;
      case 5:
        return <Layout5 storyInfo={storyInfo} />;
      case 6:
        return <Layout6 />;
      default:
        return <Layout1 storyInfo={storyInfo} />;
    }
  };

  return (
    <StoryWrapper
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 캡처 영역 - 배경 + 콘텐츠 */}
      <CaptureArea ref={captureRef}>
        <BackgroundImage $imageUrl={getBackgroundForLayout()} />
        {renderLayout()}
      </CaptureArea>

      {/* 클릭 감지 영역 (캡처에서 제외) */}
      <ClickArea onClick={handleImageClick} data-capture-ignore="true" />

      {/* 상단 컨트롤 바 - 클릭시 페이드인/아웃 */}
      {hasInteracted && (
        <TopControlBar $visible={showControls} data-capture-ignore="true">
          <ControlButton onClick={handleBack} disabled={isCapturing}>
            <BackIcon />
          </ControlButton>
          <RightControls>
            <ControlButton onClick={handleDownload} disabled={isCapturing}>
              <DownloadIcon />
            </ControlButton>
            <ControlButton onClick={handleShare} disabled={isCapturing}>
              <ShareIcon />
            </ControlButton>
          </RightControls>
        </TopControlBar>
      )}

      {/* 이미지 인디케이터 (좌우 스와이프 안내) */}
      {storyInfo && storyInfo.images.length > 1 && (
        <ImageIndicator data-capture-ignore="true">
          {storyInfo.images.map((_, idx) => (
            <IndicatorDot
              key={idx}
              $active={idx === currentImageIndex}
              onClick={() => setCurrentImageIndex(idx)}
            />
          ))}
        </ImageIndicator>
      )}

      <BottomNavigation>
        <PageButtonsContainer>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <PageButton
              key={num}
              $active={currentLayout === num}
              onClick={() => handleLayoutChange(num)}
              disabled={isCapturing}
            >
              {num}
            </PageButton>
          ))}
        </PageButtonsContainer>
      </BottomNavigation>
    </StoryWrapper>
  );
}
