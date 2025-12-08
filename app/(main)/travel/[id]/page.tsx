"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { getContentDetail, ContentDetail } from "@/app/lib/api";

// ============ Styled Components - Figma 디자인 ============

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #ffffff);
  padding-bottom: 120px;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  position: sticky;
  top: 0;
  background-color: var(--greyscale-000, #ffffff);
  z-index: 10;
`;

const TopBarSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const Content = styled.div`
  padding: 0 20px;
`;

// 타이틀 섹션
const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
`;

const CityName = styled.h1`
  font-family: "Pretendard", sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.144px;
  color: #111111;
`;

const ThemePhrase = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #5e5b61;
`;

// 메인 이미지
const MainImageWrapper = styled.div`
  margin-bottom: 12px;
`;

const MainImage = styled.img`
  width: 100%;
  height: 212px;
  object-fit: cover;
  border-radius: 12px;
  background-color: #f1f1f1;
`;

const ImageDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
`;

const Dot = styled.button<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? "#444246" : "#FFFFFF")};
  border: 1px solid ${({ $active }) => ($active ? "#444246" : "#C4C2C6")};
  transition: all 0.2s ease;
`;

// 인트로 섹션
const IntroSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #f2f1f2;
`;

const IntroText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

// 상세 설명 섹션
const DetailSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #f2f1f2;
`;

const SectionTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: #2b2a2c;
  margin-bottom: 10px;
`;

const PlaceItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PlaceHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

const PlaceName = styled.h4`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

const PlaceDescription = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

// 인용 스타일 (> 로 시작하는 요약)
const PlaceSummary = styled.div`
  background-color: #f8f9fa;
  border-left: 3px solid var(--primary-500, #4f9de8);
  padding: 12px 14px;
  margin-bottom: 12px;
  border-radius: 0 8px 8px 0;

  p {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.6;
    letter-spacing: -0.042px;
    color: #2b2a2c;
    margin: 0;
  }
`;

// 전체 본문 설명
const PlaceFullDescription = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.7;
  letter-spacing: -0.039px;
  color: #5e5b61;
  margin-bottom: 12px;

  p {
    margin: 0 0 8px 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

// 정보 항목 타입별 색상
const INFO_COLORS = {
  mood: { bg: "#E8F5E9", border: "#4CAF50", icon: "🌿" },        // 분위기: 초록색
  recommendation: { bg: "#FFF8E1", border: "#FF9800", icon: "⭐" }, // 추천: 주황색
  editorTip: { bg: "#E3F2FD", border: "#2196F3", icon: "💡" },   // 에디터 팁: 파란색
};

const InfoItem = styled.div<{ $type?: "mood" | "recommendation" | "editorTip" }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 12px 14px;
  background-color: ${({ $type }) => 
    $type ? INFO_COLORS[$type].bg : "#f8f9fa"};
  border-radius: 10px;
  border-left: 4px solid ${({ $type }) => 
    $type ? INFO_COLORS[$type].border : "#4f9de8"};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.039px;
  color: #5e5b61;
  flex: 1;
`;

const InfoLabel = styled.span<{ $type?: "mood" | "recommendation" | "editorTip" }>`
  font-weight: 600;
  color: ${({ $type }) => 
    $type ? INFO_COLORS[$type].border : "#2b2a2c"};
  margin-right: 6px;
`;

const InfoText = styled.span`
  color: #444246;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
  background: none;
  border: none;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    color: #918e94;
    transition: transform 0.2s ease;
  }

  &[data-expanded="true"] svg {
    transform: rotate(180deg);
  }
`;

// 마지막 한마디 섹션
const LastMessageSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #f2f1f2;
`;

const LastMessageText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

// 하단 고정 버튼
const BottomButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px 46px;
  background-color: #ffffff;
  z-index: 100;
`;

const BottomButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: #444246;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 로딩 상태
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const LoadingWrapper = styled.div`
  padding: 20px;
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "20px"};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  color: #5e5b61;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background-color: #444246;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

// 커스텀 뒤로가기 버튼 (content/action back API 호출용)
const CustomBackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);

  svg {
    width: 24px;
    height: 24px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============ 아이콘 ============
const ChevronDownIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============ 텍스트 파싱 함수들 ============

// 인트로 텍스트 추출
const extractIntro = (text: string): string => {
  if (!text) return "";
  const paragraphs = text.split("\n\n").filter((p) => p.trim());
  return paragraphs[0]?.replace(/^#+\s*/, "").trim() || "";
};

// 장소 정보 파싱
interface PlaceInfo {
  name: string;
  summary: string; // > 로 시작하는 요약 (인용 스타일)
  fullDescription: string; // 전체 본문 설명
  mood?: string;
  recommendation?: string;
  editorTip?: string;
}

const parsePlaces = (text: string): PlaceInfo[] => {
  if (!text) return [];

  const places: PlaceInfo[] = [];
  const lines = text.split("\n");
  let currentPlace: Partial<PlaceInfo> | null = null;
  let isCollectingDescription = false;
  let descriptionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 장소 제목 (1. 대감게장, ### 1. 대감게장, **1. 대감게장** 등)
    const placeMatch = trimmed.match(
      /^(?:###?\s*)?(?:\*\*)?\d+\.\s*([^*\n]+)(?:\*\*)?$/
    );
    if (placeMatch) {
      // 이전 장소 저장
      if (currentPlace?.name) {
        currentPlace.fullDescription = descriptionLines.join(" ").trim();
        places.push(currentPlace as PlaceInfo);
      }
      currentPlace = {
        name: placeMatch[1].trim(),
        summary: "",
        fullDescription: "",
      };
      isCollectingDescription = false;
      descriptionLines = [];
      continue;
    }

    // > 로 시작하는 요약 (인용) - 여러 줄 지원
    if (trimmed.startsWith(">") && currentPlace) {
      const summaryText = trimmed.replace(/^>\s*/, "").trim();
      // 기존 summary가 있으면 이어붙이기
      if (currentPlace.summary) {
        currentPlace.summary += " " + summaryText;
      } else {
        currentPlace.summary = summaryText;
      }
      isCollectingDescription = true;
      continue;
    }

    // 📌 에디터 픽 섹션 감지 - 본문 수집 중지
    if (trimmed.includes("📌") || trimmed.includes("에디터 픽")) {
      isCollectingDescription = false;
      continue;
    }

    // 분위기 (🌿 또는 텍스트로) - 아이콘 유지
    if (
      (trimmed.includes("분위기") || trimmed.includes("🌿")) &&
      currentPlace
    ) {
      // 리스트 마커만 제거하고 아이콘과 내용은 그대로 유지
      const content = trimmed
        .replace(/^[-*]\s*/, "")
        .replace(/^🌿\s*분위기\s*[:：]\s*/, "")
        .replace(/^분위기\s*[:：]\s*/, "");
      currentPlace.mood = content;
      isCollectingDescription = false;
      continue;
    }

    // 추천 포인트 (⭐ 또는 텍스트로) - 아이콘 유지
    if (
      (trimmed.includes("추천") || trimmed.includes("⭐")) &&
      currentPlace &&
      !trimmed.includes("추천드")
    ) {
      // 리스트 마커만 제거하고 아이콘과 내용은 그대로 유지
      const content = trimmed
        .replace(/^[-*]\s*/, "")
        .replace(/^⭐\s*추천\s*(?:포인트)?\s*[:：]\s*/, "")
        .replace(/^추천\s*(?:포인트)?\s*[:：]\s*/, "");
      currentPlace.recommendation = content;
      isCollectingDescription = false;
      continue;
    }

    // 에디터 팁 (💡 또는 텍스트로) - 아이콘 유지
    if (
      (trimmed.includes("에디터 팁") || trimmed.includes("💡")) &&
      currentPlace
    ) {
      // 리스트 마커만 제거하고 아이콘과 내용은 그대로 유지
      const content = trimmed
        .replace(/^[-*]\s*/, "")
        .replace(/^💡\s*에디터\s*팁\s*[:：]\s*/, "")
        .replace(/^에디터\s*팁\s*[:：]\s*/, "");
      currentPlace.editorTip = content;
      isCollectingDescription = false;
      continue;
    }

    // 본문 설명 수집 (요약 이후부터 에디터 픽/분위기/추천/팁 전까지)
    // 빈 줄은 무시하고, 실제 내용이 있는 줄만 수집
    if (isCollectingDescription && currentPlace) {
      // 빈 줄은 건너뛰기 (하지만 수집 모드는 유지)
      if (!trimmed) {
        continue;
      }

      // 리스트 아이템이 아니고, 다음 장소 제목도 아닌 경우만 수집
      if (
        !trimmed.startsWith("-") &&
        !trimmed.startsWith("*") &&
        !trimmed.match(/^\d+\.\s/)
      ) {
        descriptionLines.push(trimmed);
        continue;
      }
    }
  }

  // 마지막 장소 저장
  if (currentPlace?.name) {
    currentPlace.fullDescription = descriptionLines.join(" ").trim();
    places.push(currentPlace as PlaceInfo);
  }

  return places;
};

// 마지막 메시지 추출
const extractLastMessage = (text: string): string => {
  if (!text) return "이번 여행이 특별한 추억으로 남기를 바랍니다!";

  const lines = text.split("\n").filter((line) => line.trim());

  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const line = lines[i].trim();
    if (
      line.length > 20 &&
      !line.startsWith("#") &&
      !line.startsWith("-") &&
      !line.startsWith(">") &&
      !line.startsWith("*") &&
      !line.match(/^\d+\./)
    ) {
      return line;
    }
  }

  return "이번 여행이 특별한 추억으로 남기를 바랍니다!";
};

// ============ 메인 컴포넌트 ============
export default function TravelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  // API로 콘텐츠 조회
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // 뒤로가기 핸들러
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // API로 콘텐츠 데이터 로드
  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) {
        setError("콘텐츠 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setContent(null);
      setCurrentImageIndex(0);
      setIsExpanded(false);

      try {
        const data = await getContentDetail(contentId);
        setContent(data);
      } catch (e) {
        console.error("콘텐츠 로드 에러:", e);
        setError("콘텐츠를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  // 이미지 배열 (ContentDetail의 carousel_images는 { place_id, name, images[] } 구조)
  const images =
    content?.carousel_images
      ?.flatMap((item) => item.images || [])
      .filter(Boolean) ||
    (content?.representative_image ? [content.representative_image] : []);

  // 자동 슬라이드
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  // 파싱된 데이터
  const introText = content ? extractIntro(content.content_text) : "";
  const places = content ? parsePlaces(content.content_text) : [];
  const lastMessage = content ? extractLastMessage(content.content_text) : "";

  // 표시할 장소 (접힌 상태면 1개만)
  const displayPlaces = isExpanded ? places : places.slice(0, 1);

  // 뒤로가기 버튼 렌더링
  const renderBackButton = () => (
    <CustomBackButton onClick={handleBack} aria-label="뒤로가기">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </CustomBackButton>
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <PageWrapper>
        <TopBar>
          {renderBackButton()}
          <TopBarSpacer />
        </TopBar>
        <LoadingWrapper>
          <SkeletonBox $width="40%" $height="34px" />
          <SkeletonBox $width="70%" $height="21px" />
          <SkeletonBox $height="212px" style={{ marginTop: "20px" }} />
          <SkeletonBox $height="80px" style={{ marginTop: "24px" }} />
        </LoadingWrapper>
      </PageWrapper>
    );
  }

  // 에러 상태
  if (error || !content) {
    return (
      <PageWrapper>
        <TopBar>
          {renderBackButton()}
          <TopBarSpacer />
        </TopBar>
        <ErrorWrapper>
          <ErrorIcon>😢</ErrorIcon>
          <ErrorText>{error || "콘텐츠를 찾을 수 없습니다."}</ErrorText>
          <RetryButton onClick={handleBack}>뒤로 가기</RetryButton>
        </ErrorWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar>
        {renderBackButton()}
        <TopBarSpacer />
      </TopBar>

      <Content>
        {/* 타이틀 섹션 */}
        <TitleSection>
          <CityName>{content.city_name}</CityName>
          <ThemePhrase>{content.theme_phrase}</ThemePhrase>
        </TitleSection>

        {/* 메인 이미지 */}
        {images.length > 0 && (
          <MainImageWrapper>
            <MainImage
              src={images[currentImageIndex]}
              alt={content.city_name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop";
              }}
            />
            {images.length > 1 && (
              <ImageDots>
                {images.slice(0, 4).map((_, idx) => (
                  <Dot
                    key={idx}
                    $active={idx === currentImageIndex}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </ImageDots>
            )}
          </MainImageWrapper>
        )}

        {/* 인트로 섹션 */}
        {introText && (
          <IntroSection>
            <IntroText>{introText}</IntroText>
          </IntroSection>
        )}

        {/* 상세 설명 섹션 */}
        {places.length > 0 && (
          <DetailSection>
            <SectionTitle>상세 설명</SectionTitle>

            {displayPlaces.map((place, idx) => (
              <PlaceItem key={idx}>
                <PlaceHeader>
                  <PlaceName>
                    {idx + 1}. {place.name}
                  </PlaceName>
                </PlaceHeader>

                {/* 인용 스타일 요약 */}
                {place.summary && (
                  <PlaceSummary>
                    <p>{place.summary}</p>
                  </PlaceSummary>
                )}

                {/* 전체 본문 설명 */}
                {place.fullDescription && (
                  <PlaceFullDescription>
                    <p>{place.fullDescription}</p>
                  </PlaceFullDescription>
                )}

                {place.mood && (
                  <InfoItem $type="mood">
                    <InfoIcon>🌿</InfoIcon>
                    <InfoContent>
                      <InfoLabel $type="mood">분위기</InfoLabel>
                      <InfoText>{place.mood}</InfoText>
                    </InfoContent>
                  </InfoItem>
                )}

                {place.recommendation && (
                  <InfoItem $type="recommendation">
                    <InfoIcon>⭐</InfoIcon>
                    <InfoContent>
                      <InfoLabel $type="recommendation">추천 포인트</InfoLabel>
                      <InfoText>{place.recommendation}</InfoText>
                    </InfoContent>
                  </InfoItem>
                )}

                {place.editorTip && (
                  <InfoItem $type="editorTip">
                    <InfoIcon>💡</InfoIcon>
                    <InfoContent>
                      <InfoLabel $type="editorTip">에디터 팁</InfoLabel>
                      <InfoText>{place.editorTip}</InfoText>
                    </InfoContent>
                  </InfoItem>
                )}
              </PlaceItem>
            ))}

            {places.length > 1 && (
              <ExpandButton
                onClick={() => setIsExpanded(!isExpanded)}
                data-expanded={isExpanded}
              >
                <ChevronDownIcon />
              </ExpandButton>
            )}
          </DetailSection>
        )}

        {/* 마지막 한마디 */}
        <LastMessageSection>
          <SectionTitle>마지막 한마디</SectionTitle>
          <LastMessageText>{lastMessage}</LastMessageText>
        </LastMessageSection>
      </Content>

      {/* 하단 고정 버튼 */}
      <BottomButtonWrapper>
        <BottomButton
          onClick={() => router.push(`/chat?trip_id=${contentId}&confirm=1`)}
        >
          여기로 결정하기
        </BottomButton>
      </BottomButtonWrapper>
    </PageWrapper>
  );
}
