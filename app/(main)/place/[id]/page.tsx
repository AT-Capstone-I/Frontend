"use client";

import { useParams, useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { usePlaceDetailStream } from "@/app/hooks/usePlaceDetailStream";
import { useState, useEffect, useCallback, useMemo } from "react";

// ============ Animations ============
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ============ Styled Components ============
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000);
  padding-bottom: 34px;
`;

// 상단 네비게이션
const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  background-color: var(--greyscale-000);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  svg {
    width: 24px;
    height: 24px;
    color: var(--greyscale-1100);
  }
`;

const Spacer = styled.div`
  width: 24px;
  height: 24px;
`;

// 장소 정보 헤더
const PlaceHeader = styled.div`
  padding: 0 20px;
  margin-bottom: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const PlaceTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--greyscale-1200);
  line-height: 1.4;
  letter-spacing: -0.144px;
  flex: 1;
`;

const LikeButton = styled.button<{ $liked?: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;

  svg {
    width: 18px;
    height: 15px;
    color: ${({ $liked }) => $liked ? '#FD818B' : '#FD818B'};
    fill: ${({ $liked }) => $liked ? '#FD818B' : 'transparent'};
    stroke: #FD818B;
    stroke-width: 2;
  }
`;

const PlaceAddress = styled.button`
  font-size: 14px;
  font-weight: 400;
  color: var(--greyscale-600);
  line-height: 1.5;
  letter-spacing: -0.042px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  transition: color 0.2s ease;

  &:hover {
    color: var(--greyscale-800);
  }

  &:active {
    color: var(--primary-500);
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

// 별점
const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const RatingValue = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-800);
  line-height: 1.2;
  letter-spacing: -0.039px;
`;


// 이미지 슬라이더
const ImageSection = styled.div`
  padding: 0 20px;
  margin: 16px 0;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 212px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-200);
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: ${fadeIn} 0.3s ease;
`;

const ImageDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
`;

const ImageDot = styled.button<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $active }) => $active ? 'var(--greyscale-900)' : 'var(--greyscale-000)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--greyscale-900)' : 'var(--greyscale-400)'};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
`;

// 설명 섹션
const DescriptionSection = styled.section`
  padding: 24px 20px;
  border-bottom: 1px solid var(--greyscale-200);
`;

const DescriptionText = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: var(--greyscale-1100);
  line-height: 1.5;
  letter-spacing: -0.042px;
  white-space: pre-wrap;
`;

const DescriptionLoading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DescriptionSkeleton = styled.div`
  height: 21px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;

  &:nth-child(1) { width: 100%; }
  &:nth-child(2) { width: 95%; }
  &:nth-child(3) { width: 80%; }
`;

const LoadingHint = styled.p`
  font-size: 13px;
  color: var(--greyscale-600);
  margin-top: 8px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// AI 분석 섹션
const AISection = styled.section`
  padding: 24px 20px;
  border-bottom: 1px solid var(--greyscale-200);
`;

const AISectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--greyscale-1000);
  line-height: 1.4;
  letter-spacing: -0.096px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AICard = styled.div`
  background-color: #E8F4FA;
  border-radius: 12px;
  padding: 16px;
`;

const AIMood = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: var(--greyscale-1100);
  line-height: 1.5;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const ProsConsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const ProsConsColumn = styled.div``;

const ProsConsTitle = styled.h4<{ $type: 'pros' | 'cons' }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $type }) => $type === 'pros' ? '#22C55E' : '#F97316'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProsConsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProConItem = styled.li`
  font-size: 12px;
  color: var(--greyscale-800);
  line-height: 1.6;
  margin-bottom: 4px;
  padding-left: 10px;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--greyscale-500);
  }
`;

const IdealForSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const IdealForTag = styled.span<{ $highlighted?: boolean }>`
  padding: 8px 14px;
  background: ${({ $highlighted }) => $highlighted ? 'var(--primary-500)' : 'var(--greyscale-000)'};
  color: ${({ $highlighted }) => $highlighted ? 'var(--greyscale-000)' : 'var(--greyscale-800)'};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
`;

const AILoadingCard = styled.div`
  background-color: #E8F4FA;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AILoadingText = styled.p`
  font-size: 14px;
  color: var(--greyscale-600);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// 정보 섹션
const InfoSection = styled.section`
  padding: 24px 20px;
  border-bottom: 1px solid var(--greyscale-200);
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 20px;
    height: 20px;
    color: var(--greyscale-600);
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: var(--greyscale-500);
  display: block;
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: var(--greyscale-800);
  line-height: 1.5;
`;

const MoreButton = styled.button<{ $expanded?: boolean }>`
  background: none;
  border: none;
  padding: 4px;
  margin-top: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--greyscale-600);
  transition: transform 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--greyscale-800);
  }
`;

// 섹션 타이틀
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--greyscale-1000);
  line-height: 1.4;
  letter-spacing: -0.096px;
  margin-bottom: 10px;
`;

// 여행 지역 섹션
const MapSection = styled.section`
  padding: 24px 20px 16px;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 212px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: var(--greyscale-200);
`;

const MapImage = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--greyscale-200);
  color: var(--greyscale-600);
  font-size: 14px;
`;

const MapButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  background-color: var(--greyscale-900);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--greyscale-000);
  text-decoration: none;
  letter-spacing: -0.096px;
  line-height: 1.4;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-1000);
  }
`;

// 스켈레톤 로딩
const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
`;

const SkeletonTitle = styled(SkeletonBase)`
  width: 60%;
  height: 34px;
  margin-bottom: 8px;
`;

const SkeletonAddress = styled(SkeletonBase)`
  width: 70%;
  height: 21px;
  margin-bottom: 8px;
`;

const SkeletonRating = styled(SkeletonBase)`
  width: 120px;
  height: 20px;
`;

const SkeletonImage = styled(SkeletonBase)`
  width: 100%;
  height: 212px;
  border-radius: 12px;
`;

// 에러 상태
const ErrorWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: var(--greyscale-000);
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--greyscale-900);
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: var(--greyscale-600);
  margin-bottom: 24px;
`;

const RetryButton = styled.button`
  padding: 14px 32px;
  background: var(--greyscale-900);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--greyscale-1000);
  }
`;

// 토스트 메시지
const Toast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(${({ $visible }) => $visible ? '0' : '20px'});
  background-color: var(--greyscale-900);
  color: var(--greyscale-000);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

// ============ 아이콘 컴포넌트들 ============
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 18 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.63 1.458a4.125 4.125 0 0 0-5.835 0L9 2.253l-.795-.795A4.126 4.126 0 0 0 2.37 7.293l.795.795L9 13.923l5.835-5.835.795-.795a4.125 4.125 0 0 0 0-5.835Z"/>
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10 1.667l2.575 5.216 5.758.84-4.166 4.06.983 5.734L10 14.808l-5.15 2.709.983-5.734-4.166-4.06 5.758-.84L10 1.667z" 
      fill={filled ? "#FECC69" : "#E1E1E4"}
    />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);

// ============ 영업시간 파싱 함수 ============
const parseOpeningHours = (hoursString: string): string[] => {
  if (!hoursString) return [];
  
  // 다양한 구분자로 split 시도
  let lines: string[] = [];
  
  // 먼저 | 로 구분 시도
  if (hoursString.includes(' | ')) {
    lines = hoursString.split(' | ');
  } 
  // \n 으로 구분 시도
  else if (hoursString.includes('\n')) {
    lines = hoursString.split('\n');
  }
  // 쉼표로 구분 시도 (요일이 포함된 경우만)
  else if (hoursString.includes(',') && /월|화|수|목|금|토|일|Mon|Tue|Wed|Thu|Fri|Sat|Sun/i.test(hoursString)) {
    lines = hoursString.split(',');
  }
  // 구분자가 없으면 그대로 사용
  else {
    lines = [hoursString];
  }

  // 빈 줄 제거 및 trim
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

// ============ 메인 컴포넌트 ============
export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 이미지 URL을 프록시 URL로 변환 (Google/외부 이미지)
  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('/api/')) return url;
    if (url.startsWith('/')) return url;
    if (url.startsWith('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // 이미지 로드 에러 핸들러
  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // 주소 복사 핸들러
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const {
    details,
    summary,
    isDetailsLoading,
    isSummaryLoading,
    error,
    refetch,
  } = usePlaceDetailStream(placeId);

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&h=450&fit=crop';
  
  // 랜덤으로 최대 5개의 이미지만 선택
  const photos = useMemo(() => {
    if (!details) return [DEFAULT_IMAGE];
    
    const detailsAny = details as Record<string, unknown>;
    const possibleFields = ['photos', 'photo_urls', 'images', 'image_urls', 'photo'];
    
    let allPhotos: string[] = [DEFAULT_IMAGE];
    for (const field of possibleFields) {
      const value = detailsAny[field];
      if (Array.isArray(value) && value.length > 0) {
        allPhotos = value as string[];
        break;
      }
    }
    
    if (allPhotos.length <= 5) return allPhotos;
    
    // Fisher-Yates 셔플로 랜덤 선택
    const shuffled = [...allPhotos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5);
  }, [details]);

  // 자동 슬라이드 기능
  useEffect(() => {
    // 사진이 2장 이상일 때만 자동 슬라이드
    if (photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }, 4000); // 4초마다 슬라이드
    
    return () => clearInterval(interval);
  }, [photos.length]);

  // 에러 상태
  if (error) {
    return (
      <ErrorWrapper>
        <ErrorIcon>😢</ErrorIcon>
        <ErrorTitle>정보를 불러올 수 없어요</ErrorTitle>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={refetch}>다시 시도</RetryButton>
      </ErrorWrapper>
    );
  }

  // 로딩 상태 (기본 정보)
  if (isDetailsLoading) {
    return (
      <PageWrapper>
        <TopBar>
          <BackButton onClick={() => router.back()}>
            <BackIcon />
          </BackButton>
          <Spacer />
        </TopBar>
        <PlaceHeader>
          <SkeletonTitle />
          <SkeletonAddress />
          <SkeletonRating />
        </PlaceHeader>
        <ImageSection>
          <SkeletonImage />
        </ImageSection>
      </PageWrapper>
    );
  }

  if (!details) return null;

  // 현재 표시할 이미지 URL 계산
  const getCurrentImageUrl = (index: number): string => {
    if (imageErrors.has(index)) {
      return DEFAULT_IMAGE;
    }
    return getProxiedImageUrl(photos[index]);
  };

  // 네이버 지도 URL 생성 (도로명 주소만 사용)
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(details.address)}`;

  // AI 분석 데이터가 있는지 확인
  const hasAIAnalysis = summary && (summary.mood || (summary.pros && summary.pros.length > 0) || (summary.ideal_for && summary.ideal_for.length > 0));

  // 영업시간/전화번호 정보가 있는지 확인
  const hasInfo = details.opening_hours || details.phone;

  return (
    <PageWrapper>
      {/* 상단 네비게이션 */}
      <TopBar>
        <BackButton onClick={() => router.back()}>
          <BackIcon />
        </BackButton>
        <Spacer />
      </TopBar>

      {/* 장소 정보 헤더 */}
      <PlaceHeader>
        <TitleRow>
          <PlaceTitle>{details.name}</PlaceTitle>
          <LikeButton $liked={isLiked} onClick={() => setIsLiked(!isLiked)}>
            <HeartIcon />
          </LikeButton>
        </TitleRow>
        <PlaceAddress onClick={() => handleCopyAddress(details.address)}>
          <LocationIcon />{details.address}
        </PlaceAddress>
        <RatingWrapper>
          <StarRating>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= Math.round(details.rating || 0)} />
            ))}
          </StarRating>
          <RatingValue>{details.rating?.toFixed(1) || '-'}</RatingValue>
        </RatingWrapper>
      </PlaceHeader>

      {/* 이미지 슬라이더 */}
      <ImageSection>
        <ImageWrapper>
          <MainImage 
            src={getCurrentImageUrl(currentImageIndex)} 
            alt={details.name}
            onError={() => handleImageError(currentImageIndex)}
          />
        </ImageWrapper>
        {photos.length > 1 && (
          <ImageDots>
            {photos.map((_, index) => (
              <ImageDot
                key={index}
                $active={index === currentImageIndex}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </ImageDots>
        )}
      </ImageSection>

      {/* 설명 섹션 - description 사용 */}
      <DescriptionSection>
        {isSummaryLoading ? (
          <DescriptionLoading>
            <DescriptionSkeleton />
            <DescriptionSkeleton />
            <DescriptionSkeleton />
            <LoadingHint>AI가 장소 정보를 분석하고 있어요... ✨</LoadingHint>
          </DescriptionLoading>
        ) : summary?.description ? (
          <DescriptionText>{summary.description}</DescriptionText>
        ) : summary?.mood ? (
          <DescriptionText>{summary.mood}</DescriptionText>
        ) : (
          <DescriptionText>
            {details.name}은(는) {details.city}에 위치한 곳입니다. 
            {details.user_ratings_total ? ` ${details.user_ratings_total.toLocaleString()}개의 리뷰가 있으며,` : ''} 
            {details.rating ? ` 평점 ${details.rating.toFixed(1)}점을 받았습니다.` : ''}
          </DescriptionText>
        )}
      </DescriptionSection>

      {/* AI 분석 섹션 - 데이터가 있을 때만 표시 */}
      {isSummaryLoading ? (
        <AISection>
          <AISectionTitle>
            <SparkleIcon />
            AI 분석
          </AISectionTitle>
          <AILoadingCard>
            <AILoadingText>AI가 분석 중이에요... ✨</AILoadingText>
          </AILoadingCard>
        </AISection>
      ) : hasAIAnalysis && (
        <AISection>
          <AISectionTitle>
            <SparkleIcon />
            AI 분석
          </AISectionTitle>
          <AICard>
            {/* 한줄 요약 */}
            {summary?.mood && (
              <AIMood>{summary.mood}</AIMood>
            )}

            {/* 좋은점 / 아쉬운점 */}
            {((summary?.pros && summary.pros.length > 0) || (summary?.cons && summary.cons.length > 0)) && (
              <ProsConsGrid>
                {summary?.pros && summary.pros.length > 0 && (
                  <ProsConsColumn>
                    <ProsConsTitle $type="pros">👍 좋은점</ProsConsTitle>
                    <ProsConsList>
                      {summary.pros.slice(0, 4).map((pro, i) => (
                        <ProConItem key={i}>{pro}</ProConItem>
                      ))}
                    </ProsConsList>
                  </ProsConsColumn>
                )}
                {summary?.cons && summary.cons.length > 0 && (
                  <ProsConsColumn>
                    <ProsConsTitle $type="cons">👎 아쉬운점</ProsConsTitle>
                    <ProsConsList>
                      {summary.cons.slice(0, 4).map((con, i) => (
                        <ProConItem key={i}>{con}</ProConItem>
                      ))}
                    </ProsConsList>
                  </ProsConsColumn>
                )}
              </ProsConsGrid>
            )}

            {/* 추천 태그 */}
            {summary?.ideal_for && summary.ideal_for.length > 0 && (
              <IdealForSection>
                {summary.ideal_for.map((item, i) => (
                  <IdealForTag key={i} $highlighted={i < 2}>
                    {item}
                  </IdealForTag>
                ))}
              </IdealForSection>
            )}
          </AICard>
        </AISection>
      )}

      {/* 영업시간 / 전화번호 - 데이터가 있을 때만 표시 */}
      {hasInfo && (
        <InfoSection>
          {details.opening_hours && (() => {
            const hours = parseOpeningHours(details.opening_hours);
            const displayHours = showAllHours ? hours : hours.slice(0, 3);
            const hasMore = hours.length > 3;
            
            return (
              <InfoRow>
                <ClockIcon />
                <InfoContent>
                  <InfoLabel>영업시간</InfoLabel>
                  <InfoValue>
                    {displayHours.map((line, i) => (
                      <span key={i} style={{ display: 'block' }}>{line}</span>
                    ))}
                  </InfoValue>
                  {hasMore && (
                    <MoreButton $expanded={showAllHours} onClick={() => setShowAllHours(!showAllHours)}>
                      <ChevronDownIcon />
                    </MoreButton>
                  )}
                </InfoContent>
              </InfoRow>
            );
          })()}
          {details.phone && (
            <InfoRow>
              <PhoneIcon />
              <InfoContent>
                <InfoLabel>전화번호</InfoLabel>
                <InfoValue>
                  <a href={`tel:${details.phone}`} style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>
                    {details.phone}
                  </a>
                </InfoValue>
              </InfoContent>
            </InfoRow>
          )}
        </InfoSection>
      )}

      {/* 여행 지역 섹션 */}
      <MapSection>
        <SectionTitle>여행 지역</SectionTitle>
        <MapWrapper>
          {details.latitude && details.longitude ? (
            <MapImage
              src={`https://maps.google.com/maps?q=${details.latitude},${details.longitude}&z=16&output=embed`}
              loading="lazy"
              title="지도"
            />
          ) : (
            <MapPlaceholder>지도를 불러올 수 없습니다</MapPlaceholder>
          )}
        </MapWrapper>
        <MapButton href={naverMapUrl} target="_blank" rel="noopener noreferrer">
          네이버 지도 확인하기
        </MapButton>
      </MapSection>

      {/* 토스트 메시지 */}
      <Toast $visible={showToast}>주소가 복사되었습니다</Toast>
    </PageWrapper>
  );
}

