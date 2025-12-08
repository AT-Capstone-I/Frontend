"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { BackButton } from "@/app/components";
import { ThemeContent } from "@/app/lib/api";

// ============ Styled Components - Figma 디자인 ============

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #FFFFFF);
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
  background-color: var(--greyscale-000, #FFFFFF);
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
  font-family: 'Pretendard', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.144px;
  color: #111111;
`;

const ThemePhrase = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #5E5B61;
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
  background-color: #F1F1F1;
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
  background-color: ${({ $active }) => $active ? '#444246' : '#FFFFFF'};
  border: 1px solid ${({ $active }) => $active ? '#444246' : '#C4C2C6'};
  transition: all 0.2s ease;
`;

// 인트로 섹션
const IntroSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #F2F1F2;
`;

const IntroText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

// 상세 설명 섹션
const DetailSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #F2F1F2;
`;

const SectionTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: #2B2A2C;
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
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

const PlaceDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: #111112;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 2px;
  align-items: flex-start;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoBar = styled.div`
  width: 3px;
  height: 16px;
  background-color: var(--primary-500, #4F9DE8);
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoContent = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: #5E5B61;
  flex: 1;
  
  strong {
    font-weight: 500;
    color: #2B2A2C;
  }
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
    color: #918E94;
    transition: transform 0.2s ease;
  }
  
  &[data-expanded="true"] svg {
    transform: rotate(180deg);
  }
`;

// 마지막 한마디 섹션
const LastMessageSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid #F2F1F2;
`;

const LastMessageText = styled.p`
  font-family: 'Pretendard', sans-serif;
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
  background-color: #FFFFFF;
  z-index: 100;
`;

const BottomButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: #444246;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
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
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
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
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  color: #5E5B61;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background-color: #444246;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

// ============ 아이콘 ============
const ChevronDownIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ============ 텍스트 파싱 함수들 ============

// 인트로 텍스트 추출
const extractIntro = (text: string): string => {
  if (!text) return '';
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs[0]?.replace(/^#+\s*/, '').trim() || '';
};

// 장소 정보 파싱
interface PlaceInfo {
  name: string;
  description: string;
  mood?: string;
  recommendation?: string;
  editorTip?: string;
}

const parsePlaces = (text: string): PlaceInfo[] => {
  if (!text) return [];
  
  const places: PlaceInfo[] = [];
  const lines = text.split('\n');
  let currentPlace: Partial<PlaceInfo> | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 장소 제목 (1. 대감게장, ### 1. 대감게장, **1. 대감게장** 등)
    const placeMatch = trimmed.match(/^(?:###?\s*)?(?:\*\*)?\d+\.\s*([^*\n]+)(?:\*\*)?$/);
    if (placeMatch) {
      if (currentPlace?.name) {
        places.push(currentPlace as PlaceInfo);
      }
      currentPlace = { name: placeMatch[1].trim(), description: '' };
      continue;
    }
    
    // 설명 텍스트 (장소 제목 다음 줄)
    if (currentPlace && !currentPlace.description && trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      currentPlace.description = trimmed;
      continue;
    }
    
    // 분위기
    if (trimmed.includes('분위기') && currentPlace) {
      const content = trimmed.replace(/^[-*]\s*/, '').replace(/분위기\s*[:：]\s*/, '');
      currentPlace.mood = content;
      continue;
    }
    
    // 추천 포인트
    if ((trimmed.includes('추천 포인트') || trimmed.includes('추천:') || trimmed.includes('추천：')) && currentPlace) {
      const content = trimmed.replace(/^[-*]\s*/, '').replace(/추천\s*(?:포인트)?\s*[:：]\s*/, '');
      currentPlace.recommendation = content;
      continue;
    }
    
    // 에디터 팁
    if (trimmed.includes('에디터 팁') && currentPlace) {
      const content = trimmed.replace(/^[-*]\s*/, '').replace(/에디터\s*팁\s*[:：]\s*/, '');
      currentPlace.editorTip = content;
      continue;
    }
  }
  
  if (currentPlace?.name) {
    places.push(currentPlace as PlaceInfo);
  }
  
  return places;
};

// 마지막 메시지 추출
const extractLastMessage = (text: string): string => {
  if (!text) return '이번 여행이 특별한 추억으로 남기를 바랍니다!';
  
  const lines = text.split('\n').filter(line => line.trim());
  
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const line = lines[i].trim();
    if (
      line.length > 20 &&
      !line.startsWith('#') &&
      !line.startsWith('-') &&
      !line.startsWith('>') &&
      !line.startsWith('*') &&
      !line.match(/^\d+\./)
    ) {
      return line;
    }
  }
  
  return '이번 여행이 특별한 추억으로 남기를 바랍니다!';
};

// ============ 메인 컴포넌트 ============
export default function TravelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  
  // sessionStorage에서 콘텐츠 조회
  const [content, setContent] = useState<ThemeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // sessionStorage에서 데이터 로드
  useEffect(() => {
    // 상태 초기화
    setIsLoading(true);
    setError(null);
    setContent(null);
    setCurrentImageIndex(0);
    setIsExpanded(false);

    const storedContent = sessionStorage.getItem('selectedThemeContent');
    
    if (storedContent && storedContent !== 'undefined' && storedContent !== 'null') {
      try {
        const parsed: ThemeContent = JSON.parse(storedContent);
        if (parsed && typeof parsed === 'object') {
          setContent(parsed);
        } else {
          setError('콘텐츠 데이터가 유효하지 않습니다.');
        }
      } catch (e) {
        console.error('콘텐츠 파싱 에러:', e);
        setError('콘텐츠를 불러오는데 실패했습니다.');
      }
    } else {
      setError('콘텐츠를 찾을 수 없습니다.');
    }
    
    setIsLoading(false);
  }, [contentId]);
  
  // 이미지 배열
  const images = content?.carousel_images?.map(img => img.image_url).filter(Boolean) || [];
  
  // 자동 슬라이드
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  // 파싱된 데이터
  const introText = content ? extractIntro(content.content_text) : '';
  const places = content ? parsePlaces(content.content_text) : [];
  const lastMessage = content ? extractLastMessage(content.content_text) : '';
  
  // 표시할 장소 (접힌 상태면 1개만)
  const displayPlaces = isExpanded ? places : places.slice(0, 1);
  
  // 로딩 상태
  if (isLoading) {
    return (
      <PageWrapper>
        <TopBar>
          <BackButton />
          <TopBarSpacer />
        </TopBar>
        <LoadingWrapper>
          <SkeletonBox $width="40%" $height="34px" />
          <SkeletonBox $width="70%" $height="21px" />
          <SkeletonBox $height="212px" style={{ marginTop: '20px' }} />
          <SkeletonBox $height="80px" style={{ marginTop: '24px' }} />
        </LoadingWrapper>
      </PageWrapper>
    );
  }
  
  // 에러 상태
  if (error || !content) {
    return (
      <PageWrapper>
        <TopBar>
          <BackButton />
          <TopBarSpacer />
        </TopBar>
        <ErrorWrapper>
          <ErrorIcon>😢</ErrorIcon>
          <ErrorText>{error || '콘텐츠를 찾을 수 없습니다.'}</ErrorText>
          <RetryButton onClick={() => router.back()}>뒤로 가기</RetryButton>
        </ErrorWrapper>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <TopBar>
        <BackButton />
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
                target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';
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
                  <PlaceName>{idx + 1}. {place.name}</PlaceName>
                  {place.description && (
                    <PlaceDescription>{place.description}</PlaceDescription>
                  )}
                </PlaceHeader>
                
                {place.mood && (
                  <InfoItem>
                    <InfoBar />
                    <InfoContent>
                      <strong>분위기:</strong> {place.mood}
                    </InfoContent>
                  </InfoItem>
                )}
                
                {place.recommendation && (
                  <InfoItem>
                    <InfoBar />
                    <InfoContent>
                      <strong>추천 포인트:</strong> {place.recommendation}
                    </InfoContent>
                  </InfoItem>
                )}
                
                {place.editorTip && (
                  <InfoItem>
                    <InfoBar />
                    <InfoContent>
                      <strong>에디터 팁:</strong> {place.editorTip}
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
        <BottomButton onClick={() => router.push(`/chat?trip_id=${contentId}&confirm=1`)}>
          여기로 결정하기
        </BottomButton>
      </BottomButtonWrapper>
    </PageWrapper>
  );
}
