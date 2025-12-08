"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import styled, { keyframes, css } from "styled-components";
// @ts-ignore - html-to-image 타입 정의 없음
import * as htmlToImage from "html-to-image";

// ============ 테스트용 하드코딩 데이터 ============
// TODO: 실제 서버에서 데이터를 받아오는 API로 교체 필요
const REGION_DATA: Record<string, RegionInfo> = {
  ulleungdo: {
    id: "ulleungdo",
    name: "울릉도",
    nameEn: "Ulleung-gun",
    description: "천혜의 비경을 간직한\n동해 유일의 도서 지역-울릉도",
    backgroundImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1200&fit=crop",
    date: "12.04",
    dayOfWeek: "Thursday",
    subtitle: "너의 취향 그대로, 맞춤 여행 시작",
    detailDescription: "청정 자연과 해산물의 천국,\n울릉도의 매력에 빠져보세요",
    isDarkBackground: true,
  },
  hangang: {
    id: "hangang",
    name: "한강 공원",
    nameEn: "Hangang Park",
    description: "서울의 휴식처,\n한강에서 즐기는 여유로운 시간",
    backgroundImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1200&fit=crop",
    date: "12.04",
    dayOfWeek: "Thursday",
    subtitle: "너의 취향 그대로, 맞춤 여행 시작",
    detailDescription: "자전거 타기, 피크닉, 야경까지\n한강에서의 완벽한 하루",
    isDarkBackground: false,
  },
  mangridangil: {
    id: "mangridangil",
    name: "망리단길",
    nameEn: "Mangni-dangil",
    description: "망리단길: 망원동 감성 카페, 소품샵, 편집숍,\n작은 음식점이 모여 있는 골목 산책길",
    backgroundImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1200&fit=crop",
    date: "12.04",
    dayOfWeek: "Thursday",
    subtitle: "너의 취향 그대로, 맞춤 여행 시작",
    detailDescription: "힙스터들의 성지,\n망원동의 숨겨진 보석을 찾아서",
    isDarkBackground: true,
  },
  yeosu: {
    id: "yeosu",
    name: "여수",
    nameEn: "Yeosu",
    description: "낭만의 도시, 여수\n밤바다와 낭만포차의 추억",
    backgroundImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1200&fit=crop",
    date: "11.12",
    dayOfWeek: "Tuesday",
    subtitle: "바다와 함께하는 특별한 여행",
    detailDescription: "오동도, 향일암, 여수 밤바다까지\n낭만이 가득한 남도 여행",
    isDarkBackground: true,
  },
  jeju: {
    id: "jeju",
    name: "제주도",
    nameEn: "Jeju Island",
    description: "자연이 선물한 섬,\n제주에서 만나는 특별한 순간들",
    backgroundImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=1200&fit=crop",
    date: "12.10",
    dayOfWeek: "Monday",
    subtitle: "힐링이 필요한 당신을 위한 여행",
    detailDescription: "한라산부터 올레길까지,\n제주의 모든 것을 담아가세요",
    isDarkBackground: false,
  },
};

interface RegionInfo {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  backgroundImage: string;
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
  background-image: url(${({ $imageUrl }) => $imageUrl});
  background-size: cover;
  background-position: center;
  z-index: 0;
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
  
  ${({ $visible }) => $visible ? css`
    animation: ${fadeIn} 0.3s ease-out forwards;
  ` : css`
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
  font-family: 'GmarketSans', sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout1EnglishTitle = styled.h2`
  font-family: 'GmarketSans', sans-serif;
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
  font-family: 'GmarketSans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: right;
  white-space: pre-line;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 레이아웃 2: 한강 공원 스타일 - 좌측 상단, 밝은 배경 (Hakgyoansim Santteutbatang M, Hakgyoansim RikodeoOTF R)
const Layout2GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0) 45%
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
  margin-bottom: 52px;
`;

const Layout2Date = styled.span`
  font-family: 'Hakgyoansim Santteutbatang', 'HakgyoansimSantteutbatang', serif;
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #111111;
`;

const HorizontalDivider = styled.div`
  width: 1px;
  height: 15px;
  background-color: #111111;
`;

const Layout2DayOfWeek = styled.span`
  font-family: 'Hakgyoansim Santteutbatang', 'HakgyoansimSantteutbatang', serif;
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #111111;
`;

const Layout2TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Layout2Subtitle = styled.p`
  font-family: 'Hakgyoansim Santteutbatang', 'HakgyoansimSantteutbatang', serif;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #2b2a2c;
`;

const Layout2Title = styled.h1`
  font-family: 'Hakgyoansim Rikodeo', 'HakgyoansimRikodeo', serif;
  font-size: 40px;
  line-height: 1.1;
  letter-spacing: -0.6px;
  color: #111111;
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
  font-family: 'Hakgyoansim Rikodeo', 'HakgyoansimRikodeo', serif;
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
  font-family: 'KOHINanum', sans-serif;
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
  filter: ${({ $isDark }) => $isDark ? 'brightness(0) invert(1)' : 'none'};
  ${({ $isDark }) => $isDark && 'drop-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);'}
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
  font-family: 'GmarketSans', sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.6px;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Layout5Description = styled.p`
  font-family: 'Pretendard', sans-serif;
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
  font-family: 'GmarketSans', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.3px;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  white-space: pre-line;
`;

const Layout6Footer = styled.p`
  font-family: 'Pretendard', sans-serif;
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
  border: ${({ $active }) => $active ? "none" : "1px solid #c4c2c6"};
  background-color: ${({ $active }) => $active ? "#66b2fe" : "#ffffff"};
  color: ${({ $active }) => $active ? "#ffffff" : "#aaa8ad"};
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => $active ? "#66b2fe" : "#f5f5f5"};
  }
`;

const AnimatedContent = styled.div`
  animation: ${contentFadeIn} 0.4s ease-out;
`;

// ============ 아이콘 컴포넌트 ============
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ============ 레이아웃 컴포넌트들 ============
interface LayoutProps {
  regionInfo: RegionInfo;
}

const Layout1 = ({ regionInfo }: LayoutProps) => (
  <Layout1Overlay>
    <AnimatedContent>
      <Layout1TitleContainer>
        <Layout1KoreanTitle>{regionInfo.name}</Layout1KoreanTitle>
        <Layout1EnglishTitle>{regionInfo.nameEn}</Layout1EnglishTitle>
      </Layout1TitleContainer>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
        <VerticalDivider />
        <Layout1Description>{regionInfo.description}</Layout1Description>
      </div>
    </AnimatedContent>
  </Layout1Overlay>
);

const Layout2 = ({ regionInfo }: LayoutProps) => (
  <>
    <Layout2GradientOverlay />
    <Layout2Content>
      <AnimatedContent>
        <Layout2DateRow>
          <Layout2Date>{regionInfo.date}</Layout2Date>
          <HorizontalDivider />
          <Layout2DayOfWeek>{regionInfo.dayOfWeek}</Layout2DayOfWeek>
        </Layout2DateRow>
        <Layout2TextContainer>
          <Layout2Subtitle>{regionInfo.subtitle}</Layout2Subtitle>
          <Layout2Title>{regionInfo.name}</Layout2Title>
        </Layout2TextContainer>
      </AnimatedContent>
    </Layout2Content>
  </>
);

const Layout3 = ({ regionInfo }: LayoutProps) => (
  <>
    <Layout3GradientOverlay />
    <Layout3Content>
      <AnimatedContent>
        <Layout3Title>{regionInfo.name}</Layout3Title>
        <Layout3Divider />
        <Layout3Description>{regionInfo.description}</Layout3Description>
      </AnimatedContent>
    </Layout3Content>
  </>
);

const Layout4 = ({ regionInfo }: LayoutProps) => (
  <Layout4Content>
    <AnimatedContent>
      <Layout4Logo 
        src="/assets/icons/icon.svg" 
        alt="MoodTrip" 
        $isDark={regionInfo.isDarkBackground}
      />
    </AnimatedContent>
  </Layout4Content>
);

const Layout5 = ({ regionInfo }: LayoutProps) => (
  <>
    <Layout5GradientOverlay />
    <Layout5Content>
      <AnimatedContent>
        <Layout5Title>{regionInfo.name}</Layout5Title>
        <Layout5Description>{regionInfo.detailDescription}</Layout5Description>
      </AnimatedContent>
    </Layout5Content>
  </>
);

const Layout6 = () => (
  <>
    <Layout6Overlay />
    <Layout6Content>
      <AnimatedContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
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
  const region = params.region as string;
  const captureRef = useRef<HTMLDivElement>(null);
  
  const [currentLayout, setCurrentLayout] = useState(1);
  const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // 테스트용 하드코딩 데이터 사용
    const info = REGION_DATA[region];
    if (info) {
      setRegionInfo(info);
    } else {
      // 기본값 설정 (알 수 없는 지역인 경우)
      setRegionInfo({
        id: region,
        name: region,
        nameEn: region,
        description: "아름다운 여행지",
        backgroundImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop",
        date: new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace('. ', '.').replace('.', ''),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        subtitle: "당신만을 위한 특별한 여행",
        detailDescription: "새로운 추억을 만들어보세요",
        isDarkBackground: true,
      });
    }
  }, [region]);

  const handleImageClick = useCallback(() => {
    setHasInteracted(true);
    setShowControls(prev => !prev);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 화면 캡처 함수
  const captureStory = useCallback(async (): Promise<Blob | null> => {
    if (!captureRef.current || !regionInfo) return null;
    
    setIsCapturing(true);
    
    try {
      // 폰트 로딩 대기
      await document.fonts.ready;
      
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 2, // 고해상도
        cacheBust: true,
        skipFonts: true, // CORS 문제 방지 - 외부 폰트 스타일시트 건너뛰기
        style: {
          // 폰트를 명시적으로 지정하여 시스템 폰트로 대체
        },
        filter: (node: Node) => {
          // 클릭 영역은 캡처에서 제외
          if (node instanceof HTMLElement && node.dataset.captureIgnore === 'true') {
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
      console.error('캡처 실패:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [regionInfo]);

  const handleDownload = useCallback(async () => {
    if (!regionInfo) return;
    
    const blob = await captureStory();
    if (!blob) {
      alert('이미지 생성에 실패했습니다.');
      return;
    }
    
    // 다운로드
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodtrip-${regionInfo.name}-${currentLayout}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [regionInfo, captureStory, currentLayout]);

  const handleShare = useCallback(async () => {
    if (!regionInfo) return;
    
    const blob = await captureStory();
    if (!blob) {
      alert('이미지 생성에 실패했습니다.');
      return;
    }
    
    const file = new File([blob], `moodtrip-${regionInfo.name}.png`, { type: 'image/png' });
    
    // Web Share API로 이미지 공유
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `MoodTrip - ${regionInfo.name}`,
          text: regionInfo.description.replace('\n', ' '),
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      // 공유 API가 지원되지 않으면 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moodtrip-${regionInfo.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert('이미지가 다운로드되었습니다!');
    }
  }, [regionInfo, captureStory]);

  const handleLayoutChange = useCallback((layout: number) => {
    setCurrentLayout(layout);
  }, []);

  if (!regionInfo) {
    return null;
  }

  const renderLayout = () => {
    switch (currentLayout) {
      case 1:
        return <Layout1 regionInfo={regionInfo} />;
      case 2:
        return <Layout2 regionInfo={regionInfo} />;
      case 3:
        return <Layout3 regionInfo={regionInfo} />;
      case 4:
        return <Layout4 regionInfo={regionInfo} />;
      case 5:
        return <Layout5 regionInfo={regionInfo} />;
      case 6:
        return <Layout6 />;
      default:
        return <Layout1 regionInfo={regionInfo} />;
    }
  };

  return (
    <StoryWrapper>
      {/* 캡처 영역 - 배경 + 콘텐츠 */}
      <CaptureArea ref={captureRef}>
        <BackgroundImage $imageUrl={regionInfo.backgroundImage} />
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
