"use client";

import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  Header,
  TabNavigation,
  PlaceCard,
  TravelCard,
  TravelNoteCard,
  PopularPlaceCard,
} from "@/app/components";
import { 
  getRecommendedPlaces, 
  getUserId, 
  getUserName,
  PlaceRecommendation 
} from "@/app/lib/api";

// ============ sessionStorage 헬퍼 함수 ============
const STORAGE_KEYS = {
  SEEN_RECOMMENDED: 'moodtrip_seen_recommended_ids',
  SEEN_POPULAR: 'moodtrip_seen_popular_ids',
  CACHED_RECOMMENDED: 'moodtrip_cached_recommended',
  CACHED_POPULAR: 'moodtrip_cached_popular',
};

// seen IDs 가져오기
const getSeenIds = (key: string): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

// seen IDs 저장하기
const saveSeenIds = (key: string, ids: Set<string>) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify([...ids]));
};

// 캐시된 장소 가져오기
const getCachedPlaces = (key: string): PlaceRecommendation[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 장소 캐시하기
const cachePlaces = (key: string, places: PlaceRecommendation[]) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(places));
};

// seen IDs 초기화
const clearSeenIds = (key: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
};

// 로딩 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components - Figma Design System 적용
const MainContent = styled.main`
  padding-bottom: 80px;
  background-color: var(--greyscale-000);
`;

const RecommendationMessage = styled.div`
  padding: 28px 20px 24px;
  background-color: var(--greyscale-000);

  p {
    color: var(--greyscale-1100);
    font-size: 18px;
    font-weight: 400;
    line-height: 1.4;
    letter-spacing: -0.108px;
    margin-bottom: 2px;
  }

  h2 {
    color: var(--greyscale-1100);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.12px;
  }

  @media (min-width: 768px) {
    padding: 36px 40px 32px;

    p {
      font-size: 20px;
    }

    h2 {
      font-size: 24px;
    }
  }

  @media (min-width: 1024px) {
    padding: 44px 60px 40px;

    p {
      font-size: 22px;
    }

    h2 {
      font-size: 28px;
    }
  }
`;

const Section = styled.section`
  padding: 12px 20px;

  @media (min-width: 768px) {
    padding: 16px 40px;
  }

  @media (min-width: 1024px) {
    padding: 20px 60px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1100);

  @media (min-width: 768px) {
    font-size: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`;

const RefreshButton = styled.button<{ $isLoading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700);
  background: none;
  border: none;
  cursor: ${({ $isLoading }) => ($isLoading ? 'not-allowed' : 'pointer')};
  transition: color 0.2s ease;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.6 : 1)};

  &:hover {
    color: ${({ $isLoading }) => ($isLoading ? 'var(--greyscale-700)' : 'var(--primary-500)')};
  }

  svg {
    width: 14px;
    height: 14px;
    animation: ${({ $isLoading }) => ($isLoading ? spin : 'none')} 1s linear infinite;
  }

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

const SectionMore = styled.button`
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-800);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-500);
  }

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

const PlaceCardScroll = styled.div`
  display: flex;
  gap: 13px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    gap: 16px;
  }
`;

const HorizontalScroll = styled.div`
  display: flex;
  gap: 13px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    gap: 16px;
  }
`;

const LoadingCard = styled.div`
  min-width: 200px;
  height: 180px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const LoadingSmallCard = styled.div`
  min-width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--greyscale-600);

  p {
    font-size: 14px;
    line-height: 1.5;
  }
`;

// 기본 이미지 (사진이 없을 때 사용)
const DEFAULT_PLACE_IMAGE = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=300&fit=crop";

// 여행 탭용 샘플 데이터 (아직 API 없음)
const travelNotes = [
  {
    id: 1,
    title: "여수",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    title: "제주도",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    title: "서울",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    title: "대전",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=200&h=200&fit=crop",
  },
];

const travelRecommendations = [
  {
    id: 1,
    title: "여수",
    description: "바다와 함께하는 카페 투어",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "전주",
    description: "고즈넉한 한옥 마을의 향기",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "부산",
    description: "해운대의 멋진 일몰",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=300&fit=crop",
  },
];

// 시간대별 인사말 생성
function getGreeting(userName: string | null): { line1: string; line2: string } {
  const hour = new Date().getHours();
  const name = userName || '여행자';
  
  if (hour >= 5 && hour < 12) {
    return {
      line1: `좋은 아침이에요, ${name}님!`,
      line2: "오늘 하루도 좋은 여행 되세요 ✨"
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      line1: `안녕하세요, ${name}님!`,
      line2: "이런 장소는 어떨까요?"
    };
  } else {
    return {
      line1: `좋은 저녁이에요, ${name}님!`,
      line2: "오늘 하루 여행은 어떠셨나요?"
    };
  }
}

// 새로고침 아이콘 컴포넌트
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909M21 3V8H16" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"place" | "travel">("place");
  const [userName, setUserName] = useState<string | null>(null);
  const [recommendedPlaces, setRecommendedPlaces] = useState<PlaceRecommendation[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<PlaceRecommendation[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 맞춤 추천 장소 가져오기 (새로고침 버튼용)
  const fetchRecommendedPlaces = useCallback(async (isRefresh: boolean = false) => {
    const userId = getUserId();
    if (!userId) return;

    // 초기 로딩이고 캐시가 있으면 캐시 사용
    if (!isRefresh) {
      const cached = getCachedPlaces(STORAGE_KEYS.CACHED_RECOMMENDED);
      if (cached && cached.length > 0) {
        setRecommendedPlaces(cached);
        setIsLoadingRecommend(false);
        return;
      }
    }

    setIsLoadingRecommend(true);
    
    try {
      // 더 많은 결과를 요청해서 이전에 본 장소 필터링
      const maxResults = isRefresh ? 15 : 5;
      const result = await getRecommendedPlaces(userId, '경기 안성시', {
        domain: 'unified',
        maxResults: maxResults,
        useRerank: true,
      });

      let newPlaces = result.places;
      const seenIds = getSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED);
      
      // 새로고침인 경우, 이전에 본 장소 제외
      if (isRefresh && seenIds.size > 0) {
        newPlaces = result.places.filter(
          place => !seenIds.has(place.place_id)
        );
        
        // 필터링 후 장소가 없으면 캐시 초기화하고 전체 반환
        if (newPlaces.length === 0) {
          clearSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED);
          newPlaces = result.places;
        }
      }

      // 최대 5개만 표시
      newPlaces = newPlaces.slice(0, 5);
      
      // 현재 표시할 장소들을 seen에 추가
      newPlaces.forEach(place => seenIds.add(place.place_id));
      saveSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED, seenIds);
      
      // 현재 장소를 캐시에 저장
      cachePlaces(STORAGE_KEYS.CACHED_RECOMMENDED, newPlaces);
      
      setRecommendedPlaces(newPlaces);
    } catch (err) {
      console.error('추천 데이터 로딩 실패:', err);
      setError('추천 장소를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingRecommend(false);
    }
  }, []);

  // 인기 장소 가져오기 (새로고침 버튼용)
  const fetchPopularPlaces = useCallback(async (isRefresh: boolean = false) => {
    const userId = getUserId();
    if (!userId) return;

    // 초기 로딩이고 캐시가 있으면 캐시 사용
    if (!isRefresh) {
      const cached = getCachedPlaces(STORAGE_KEYS.CACHED_POPULAR);
      if (cached && cached.length > 0) {
        setPopularPlaces(cached);
        setIsLoadingPopular(false);
        return;
      }
    }

    setIsLoadingPopular(true);
    
    try {
      const maxResults = isRefresh ? 10 : 3;
      const result = await getRecommendedPlaces(userId, '경기 안성시', {
        domain: 'place',
        maxResults: maxResults,
        useRerank: true,
      });

      let newPlaces = result.places;
      const seenIds = getSeenIds(STORAGE_KEYS.SEEN_POPULAR);
      
      // 새로고침인 경우, 이전에 본 장소 제외
      if (isRefresh && seenIds.size > 0) {
        newPlaces = result.places.filter(
          place => !seenIds.has(place.place_id)
        );
        
        if (newPlaces.length === 0) {
          clearSeenIds(STORAGE_KEYS.SEEN_POPULAR);
          newPlaces = result.places;
        }
      }

      newPlaces = newPlaces.slice(0, 3);
      
      newPlaces.forEach(place => seenIds.add(place.place_id));
      saveSeenIds(STORAGE_KEYS.SEEN_POPULAR, seenIds);
      
      // 현재 장소를 캐시에 저장
      cachePlaces(STORAGE_KEYS.CACHED_POPULAR, newPlaces);
      
      setPopularPlaces(newPlaces);
    } catch (err) {
      console.error('인기 장소 로딩 실패:', err);
    } finally {
      setIsLoadingPopular(false);
    }
  }, []);

  // 초기 로딩
  useEffect(() => {
    const name = getUserName();
    setUserName(name);
    
    fetchRecommendedPlaces(false);
    fetchPopularPlaces(false);
  }, [fetchRecommendedPlaces, fetchPopularPlaces]);

  const greeting = getGreeting(userName);

  // 장소 이미지 가져오기 (없으면 기본 이미지)
  const getPlaceImage = (place: PlaceRecommendation): string => {
    if (place.photos && place.photos.length > 0) {
      return place.photos[0];
    }
    return DEFAULT_PLACE_IMAGE;
  };

  // 장소 설명 가져오기 (한줄평 또는 주소)
  const getPlaceDescription = (place: PlaceRecommendation): string => {
    if (place.summary && place.summary['한줄평']) {
      return place.summary['한줄평'];
    }
    return place.address || place.city || '';
  };

  // 새로고침 핸들러
  const handleRefreshRecommended = () => {
    if (!isLoadingRecommend) {
      fetchRecommendedPlaces(true);
    }
  };

  const handleRefreshPopular = () => {
    if (!isLoadingPopular) {
      fetchPopularPlaces(true);
    }
  };

  return (
    <>
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <MainContent>
        {activeTab === "place" ? (
          <>
            <RecommendationMessage>
              <p>{greeting.line1}</p>
              <h2>{greeting.line2}</h2>
            </RecommendationMessage>

            <Section>
              <SectionHeader>
                <SectionTitle>맞춤 추천 장소</SectionTitle>
                <RefreshButton 
                  onClick={handleRefreshRecommended} 
                  $isLoading={isLoadingRecommend}
                  disabled={isLoadingRecommend}
                >
                  <RefreshIcon />
                  새로고침
                </RefreshButton>
              </SectionHeader>
              <PlaceCardScroll>
                {isLoadingRecommend ? (
                  <>
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                  </>
                ) : error ? (
                  <EmptyState>
                    <p>{error}</p>
                  </EmptyState>
                ) : recommendedPlaces.length === 0 ? (
                  <EmptyState>
                    <p>추천 장소가 없습니다.<br />나중에 다시 시도해주세요.</p>
                  </EmptyState>
                ) : (
                  recommendedPlaces.map((place) => (
                    <PlaceCard
                      key={place.place_id}
                      title={place.name || '장소'}
                      description={getPlaceDescription(place)}
                      image={getPlaceImage(place)}
                    />
                  ))
                )}
              </PlaceCardScroll>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>인기 장소</SectionTitle>
                <RefreshButton 
                  onClick={handleRefreshPopular} 
                  $isLoading={isLoadingPopular}
                  disabled={isLoadingPopular}
                >
                  <RefreshIcon />
                  새로고침
                </RefreshButton>
              </SectionHeader>
              <HorizontalScroll>
                {isLoadingPopular ? (
                  <>
                    <LoadingSmallCard />
                    <LoadingSmallCard />
                    <LoadingSmallCard />
                  </>
                ) : popularPlaces.length === 0 ? (
                  <EmptyState>
                    <p>인기 장소가 없습니다.</p>
                  </EmptyState>
                ) : (
                  popularPlaces.map((place, index) => (
                    <PopularPlaceCard
                      key={place.place_id}
                      id={index + 1}
                      title={place.name || '장소'}
                      description={place.address || place.city || ''}
                      image={getPlaceImage(place)}
                    />
                  ))
                )}
              </HorizontalScroll>
            </Section>
          </>
        ) : (
          <>
            <RecommendationMessage>
              <p>어디론가 훌쩍 떠나고 싶다면,</p>
              <h2>나만을 위한 특별한 여행을 만나볼까요?</h2>
            </RecommendationMessage>

            <Section>
              <SectionHeader>
                <SectionTitle>작성 중인 여행 노트</SectionTitle>
                <SectionMore>전체 보기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {travelNotes.map((note) => (
                  <TravelNoteCard
                    key={note.id}
                    title={note.title}
                    image={note.image}
                  />
                ))}
              </HorizontalScroll>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>여행 추천</SectionTitle>
                <SectionMore>추천 받기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {travelRecommendations.map((travel) => (
                  <TravelCard
                    key={travel.id}
                    title={travel.title}
                    description={travel.description}
                    image={travel.image}
                  />
                ))}
              </HorizontalScroll>
            </Section>
          </>
        )}
      </MainContent>
    </>
  );
}
