"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import {
  Header,
  Footer,
  TabNavigation,
  PlaceCard,
  TravelCard,
  TravelNoteCard,
  PopularPlaceCard,
} from "@/app/components";
import {
  getRecommendedPlaces,
  getPopularPlaces,
  getRecommendedContents,
  getTravelNotes,
  getUserId,
  getUserName,
  PlaceRecommendation,
  PopularPlace,
  ContentRecommendation,
  TravelNote,
  StoryImageEntry,
} from "@/app/lib/api";
import { useGeolocation } from "@/app/hooks/useGeolocation";

// ============ sessionStorage 헬퍼 함수 ============
const STORAGE_KEYS = {
  SEEN_RECOMMENDED: "moodtrip_seen_recommended_ids",
  SEEN_POPULAR: "moodtrip_seen_popular_ids",
  SEEN_CONTENTS: "moodtrip_seen_contents_ids",
  CACHED_RECOMMENDED: "moodtrip_cached_recommended",
  CACHED_POPULAR: "moodtrip_cached_popular",
  CACHED_CONTENTS: "moodtrip_cached_contents",
  CACHED_STORY_IMAGES: "moodtrip_cached_story_images",
};

// seen IDs 가져오기
const getSeenIds = (key: string): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

// seen IDs 저장하기
const saveSeenIds = (key: string, ids: Set<string>) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify([...ids]));
};

// 캐시된 추천 장소 가져오기
const getCachedRecommendedPlaces = (
  key: string
): PlaceRecommendation[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 캐시된 인기 장소 가져오기
const getCachedPopularPlaces = (key: string): PopularPlace[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 추천 장소 캐시하기
const cacheRecommendedPlaces = (key: string, places: PlaceRecommendation[]) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(places));
};

// 인기 장소 캐시하기
const cachePopularPlaces = (key: string, places: PopularPlace[]) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(places));
};

// 캐시된 콘텐츠 가져오기
const getCachedContents = (key: string): ContentRecommendation[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 콘텐츠 캐시하기
const cacheContents = (key: string, contents: ContentRecommendation[]) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(contents));
};

// 캐시된 스토리 이미지 가져오기
const getCachedStoryImages = (key: string): Record<string, StoryImageEntry> | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 스토리 이미지 캐시하기
const cacheStoryImages = (key: string, images: Record<string, StoryImageEntry>) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(images));
};

// seen IDs 초기화
const clearSeenIds = (key: string) => {
  if (typeof window === "undefined") return;
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

// 고정 헤더 래퍼
const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--greyscale-000);
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
  cursor: ${({ $isLoading }) => ($isLoading ? "not-allowed" : "pointer")};
  transition: color 0.2s ease;
  opacity: ${({ $isLoading }) => ($isLoading ? 0.6 : 1)};

  &:hover {
    color: ${({ $isLoading }) =>
      $isLoading ? "var(--greyscale-700)" : "var(--primary-500)"};
  }

  svg {
    width: 14px;
    height: 14px;
    animation: ${({ $isLoading }) => ($isLoading ? spin : "none")} 1s linear
      infinite;
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
  padding-right: 20px;
  margin-right: -20px;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    padding-right: 40px;
    margin-right: -40px;
  }

  @media (min-width: 1024px) {
    gap: 16px;
    padding-right: 60px;
    margin-right: -60px;
  }
`;

const HorizontalScroll = styled.div`
  display: flex;
  gap: 13px;
  overflow-x: auto;
  padding-bottom: 4px;
  padding-right: 20px;
  margin-right: -20px;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    padding-right: 40px;
    margin-right: -40px;
  }

  @media (min-width: 1024px) {
    gap: 16px;
    padding-right: 60px;
    margin-right: -60px;
  }
`;

// 여행 이벤트 정사각형 카드
const EventCard = styled.button`
  position: relative;
  min-width: 140px;
  aspect-ratio: 1;
  border: none;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: #0c0d16;
  color: #ffffff;
  flex-shrink: 0;
`;

const EventImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EventOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 9, 20, 0) 35%, rgba(8, 9, 20, 0.82) 100%);
`;

const EventBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(12, 13, 22, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
`;

const EventText = styled.div`
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #ffffff;
  text-align: left;
`;

const EventTitle = styled.h4`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.18px;
`;

const EventSubtitle = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
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

// 새 여행 노트 추가 버튼 카드
const AddNoteCard = styled.button`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 74px;
  gap: 4px;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  @media (min-width: 768px) {
    width: 90px;
  }

  @media (min-width: 1024px) {
    width: 100px;
  }
`;

const AddNoteIconWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  background-color: var(--greyscale-100);
  border: 2px dashed var(--greyscale-300);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--greyscale-200);
    border-color: var(--primary-500);
  }

  svg {
    width: 24px;
    height: 24px;
    color: var(--greyscale-500);
    transition: color 0.2s ease;
  }

  ${AddNoteCard}:hover & svg {
    color: var(--primary-500);
  }
`;

const AddNoteText = styled.p`
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-600);
  text-align: center;

  @media (min-width: 768px) {
    font-size: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

// 기본 이미지 (사진이 없을 때 사용) - 폴백 제거, 스켈레톤으로 대체
const DEFAULT_PLACE_IMAGE = "";

// 여행 이벤트 카드 데이터
type TravelEventCard = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string; // 구현 전이므로 선택값
};

const TRAVEL_EVENT_CARDS: TravelEventCard[] = [
  {
    id: "instagram",
    badge: "이벤트",
    title: "인스타그램 친구하기",
    subtitle: "#여행정보 #실시간이벤트",
    image: "/assets/images/instagram.png",
  },
  {
    id: "naver-blog",
    badge: "이벤트",
    title: "네이버 블로그 구독",
    subtitle: "#여행후기 #체험단",
    image: "/assets/images/naverblog.png",
  },
  {
    id: "kakao-friend",
    badge: "혜택",
    title: "카카오 플친 전용 쿠폰",
    subtitle: "신규 3천원 즉시할인",
    image: "/assets/images/kakaotalk.png",
  },
  {
    id: "newsletter",
    badge: "WEEKLY",
    title: "여행 뉴스레터 구독",
    subtitle: "매주 베스트 루트·딜",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
  },
];

// 시간대별 인사말 생성
function getGreeting(userName: string | null): {
  line1: string;
  line2: string;
} {
  const hour = new Date().getHours();
  const name = userName || "여행자";

  if (hour >= 5 && hour < 12) {
    return {
      line1: `좋은 아침이에요, ${name}님!`,
      line2: "오늘도 좋은 하루 되세요 ✨",
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      line1: `안녕하세요, ${name}님!`,
      line2: "이런 장소는 어떨까요?",
    };
  } else {
    return {
      line1: `좋은 저녁이에요, ${name}님!`,
      line2: "나만을 위한 특별한 여행을 만나볼까요?",
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

// + 아이콘 컴포넌트
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  const [activeTab, setActiveTab] = useState<"place" | "travel">("place");
  const [userName, setUserName] = useState<string | null>(null);
  const [recommendedPlaces, setRecommendedPlaces] = useState<
    PlaceRecommendation[]
  >([]);
  const [popularPlaces, setPopularPlaces] = useState<PopularPlace[]>([]);
  const [travelContents, setTravelContents] = useState<ContentRecommendation[]>(
    []
  );
  const [planningNotes, setPlanningNotes] = useState<TravelNote[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingContents, setIsLoadingContents] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 콘텐츠 API 응답에서 받은 도시별 스토리 이미지
  const [storyImages, setStoryImages] = useState<Record<string, StoryImageEntry>>({});

  // 맞춤 추천 장소 가져오기 (새로고침 버튼용)
  const fetchRecommendedPlaces = useCallback(
    async (isRefresh: boolean = false) => {
      const userId = getUserId();
      if (!userId) return;

      // 초기 로딩이고 캐시가 있으면 캐시 사용
      if (!isRefresh) {
        const cached = getCachedRecommendedPlaces(
          STORAGE_KEYS.CACHED_RECOMMENDED
        );
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
        const result = await getRecommendedPlaces(userId, {
          latitude,
          longitude,
          domain: "unified",
          maxResults: maxResults,
          useRerank: true,
        });

        let newPlaces = result.places;
        const seenIds = getSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED);

        // 새로고침인 경우, 이전에 본 장소 제외
        if (isRefresh && seenIds.size > 0) {
          newPlaces = result.places.filter(
            (place) => !seenIds.has(place.place_id)
          );

          // 새로운 장소가 부족하면 seenIds 초기화 후 전체 반환
          if (newPlaces.length < 3) {
            clearSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED);
            seenIds.clear();
            newPlaces = result.places;
          }
        }

        // 최대 5개만 표시
        newPlaces = newPlaces.slice(0, 5);

        // 현재 표시할 장소들을 seen에 추가
        newPlaces.forEach((place) => seenIds.add(place.place_id));
        saveSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED, seenIds);

        // 현재 장소를 캐시에 저장
        cacheRecommendedPlaces(STORAGE_KEYS.CACHED_RECOMMENDED, newPlaces);

        setRecommendedPlaces(newPlaces);
      } catch (err) {
        console.error("추천 데이터 로딩 실패:", err);
        setError("추천 장소를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingRecommend(false);
      }
    },
    [latitude, longitude]
  );

  // 인기 장소 가져오기 (새로고침 버튼용) - 새 API 사용
  const fetchPopularPlaces = useCallback(async (isRefresh: boolean = false) => {
    // 초기 로딩이고 캐시가 있으면 캐시 사용
    if (!isRefresh) {
      const cached = getCachedPopularPlaces(STORAGE_KEYS.CACHED_POPULAR);
      if (cached && cached.length > 0) {
        setPopularPlaces(cached);
        setIsLoadingPopular(false);
        return;
      }
    }

    setIsLoadingPopular(true);

    try {
      const limit = isRefresh ? 30 : 20;
      const result = await getPopularPlaces({
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        limit: limit,
      });

      let newPlaces = result.places;
      const seenIds = getSeenIds(STORAGE_KEYS.SEEN_POPULAR);

      // 새로고침인 경우, 이전에 본 장소 제외
      if (isRefresh && seenIds.size > 0) {
        newPlaces = result.places.filter(
          (place) => !seenIds.has(place.place_id)
        );

        // 새로운 장소가 부족하면 seenIds 초기화 후 전체 반환
        if (newPlaces.length < 5) {
          clearSeenIds(STORAGE_KEYS.SEEN_POPULAR);
          seenIds.clear();
          newPlaces = result.places;
        }
      }

      newPlaces = newPlaces.slice(0, 10);

      newPlaces.forEach((place) => seenIds.add(place.place_id));
      saveSeenIds(STORAGE_KEYS.SEEN_POPULAR, seenIds);

      // 현재 장소를 캐시에 저장
      cachePopularPlaces(STORAGE_KEYS.CACHED_POPULAR, newPlaces);

      setPopularPlaces(newPlaces);
    } catch (err) {
      console.error("인기 장소 로딩 실패:", err);
    } finally {
      setIsLoadingPopular(false);
    }
  }, [latitude, longitude]);

  // 여행 콘텐츠 가져오기 (새로고침 버튼용)
  const fetchTravelContents = useCallback(
    async (isRefresh: boolean = false) => {
      const userId = getUserId();
      if (!userId) return;

      // 초기 로딩이고 캐시가 있으면 캐시 사용
      if (!isRefresh) {
        const cached = getCachedContents(STORAGE_KEYS.CACHED_CONTENTS);
        if (cached && cached.length > 0) {
          setTravelContents(cached);
          // 캐시된 스토리 이미지도 복원
          const cachedImages = getCachedStoryImages(STORAGE_KEYS.CACHED_STORY_IMAGES);
          if (cachedImages) {
            setStoryImages(cachedImages);
          }
          setIsLoadingContents(false);
          return;
        }
      }

      setIsLoadingContents(true);

      try {
        const maxResults = isRefresh ? 10 : 5;
        const result = await getRecommendedContents(userId, {
          maxResults: maxResults,
          useRerank: true,
        });

        let newContents = result.contents;
        const seenIds = getSeenIds(STORAGE_KEYS.SEEN_CONTENTS);

        // 새로고침인 경우, 이전에 본 콘텐츠 제외
        if (isRefresh && seenIds.size > 0) {
          newContents = result.contents.filter(
            (content) => !seenIds.has(content.content_id)
          );

          // 새로운 콘텐츠가 부족하면 seenIds 초기화 후 전체 반환
          if (newContents.length < 3) {
            clearSeenIds(STORAGE_KEYS.SEEN_CONTENTS);
            seenIds.clear();
            newContents = result.contents;
          }
        }

        newContents = newContents.slice(0, 5);

        newContents.forEach((content) => seenIds.add(content.content_id));
        saveSeenIds(STORAGE_KEYS.SEEN_CONTENTS, seenIds);

        // 현재 콘텐츠를 캐시에 저장
        cacheContents(STORAGE_KEYS.CACHED_CONTENTS, newContents);

        setTravelContents(newContents);

        // 응답에 포함된 story_images 저장 및 캐시
        if (result.story_images) {
          setStoryImages(result.story_images);
          cacheStoryImages(STORAGE_KEYS.CACHED_STORY_IMAGES, result.story_images);
        }
      } catch (err) {
        console.error("여행 콘텐츠 로딩 실패:", err);
      } finally {
        setIsLoadingContents(false);
      }
    },
    []
  );

  // 여행 노트 가져오기 (planning 상태만 홈에서 표시)
  const fetchPlanningNotes = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setIsLoadingNotes(false);
      return;
    }

    setIsLoadingNotes(true);

    try {
      const result = await getTravelNotes(userId);
      // home 화면에서는 planning 상태의 노트만 표시
      setPlanningNotes(result.planning);
    } catch (err) {
      console.error("여행 노트 로딩 실패:", err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  // 초기 로딩 (위치 무관한 데이터)
  useEffect(() => {
    const name = getUserName();
    setUserName(name);

    fetchTravelContents(false);
    fetchPlanningNotes();
  }, [fetchTravelContents, fetchPlanningNotes]);

  // 위치 기반 장소 추천 (위치 로딩 완료 후 호출)
  useEffect(() => {
    if (geoLoading) return;
    fetchRecommendedPlaces(false);
    fetchPopularPlaces(false);
  }, [geoLoading, fetchRecommendedPlaces, fetchPopularPlaces]);

  const greeting = getGreeting(userName);

  // 추천 장소 이미지 가져오기 (없으면 기본 이미지)
  const getPlaceImage = (place: PlaceRecommendation): string => {
    if (place.photos && place.photos.length > 0) {
      return place.photos[0];
    }
    return DEFAULT_PLACE_IMAGE;
  };

  // 인기 장소 이미지 가져오기 (없으면 기본 이미지)
  const getPopularPlaceImage = (place: PopularPlace): string => {
    if (place.images && place.images.length > 0) {
      return place.images[0];
    }
    return DEFAULT_PLACE_IMAGE;
  };

  // 장소 설명 가져오기 (한줄평 또는 주소)
  const getPlaceDescription = (place: PlaceRecommendation): string => {
    if (place.summary && place.summary["한줄평"]) {
      return place.summary["한줄평"];
    }
    return place.address || place.city || "";
  };

  // 콘텐츠 이미지 가져오기 (story_images에서 인덱스 기반 선택)
  const getContentImage = (content: ContentRecommendation, index: number): string => {
    const cityName = content.city_name || "";
    const entry = storyImages[cityName];
    if (entry && entry.images.length > 0) {
      return entry.images[index % entry.images.length];
    }
    return "";
  };

  // 여행 노트 이미지 가져오기 (story_images에서 인덱스 기반 선택)
  const getTravelNoteImage = (note: TravelNote, index: number): string => {
    const cityName = note.final_city || note.selected_city || "";
    const entry = storyImages[cityName];
    if (entry && entry.images.length > 0) {
      return entry.images[index % entry.images.length];
    }
    return "";
  };

  // 여행 노트 제목 가져오기
  const getTravelNoteTitle = (note: TravelNote): string => {
    return (
      note.final_city || note.selected_city || note.selected_theme || "새 여행"
    );
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

  const handleRefreshContents = () => {
    if (!isLoadingContents) {
      fetchTravelContents(true);
    }
  };

  // 새 여행 노트 추가 핸들러
  const handleAddNewTrip = () => {
    router.push("/chat?reset=1");
  };

  const handleTravelEventClick = (link?: string) => {
    if (!link) {
      if (typeof window !== "undefined") {
        alert("아직 준비 중인 이벤트입니다.");
      }
      return;
    }
    if (link.startsWith("http")) {
      window.open(link, "_blank");
      return;
    }
    router.push(link);
  };

  return (
    <>
      <StickyHeader>
        <Header showLogout={false} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </StickyHeader>

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
                    <p>
                      추천 장소가 없습니다.
                      <br />
                      나중에 다시 시도해주세요.
                    </p>
                  </EmptyState>
                ) : (
                  recommendedPlaces.map((place) => (
                    <PlaceCard
                      key={place.place_id}
                      id={place.place_id}
                      title={place.name || "장소"}
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
                    <LoadingCard />
                    <LoadingCard />
                  </>
                ) : popularPlaces.length === 0 ? (
                  <EmptyState>
                    <p>인기 장소가 없습니다.</p>
                  </EmptyState>
                ) : (
                  popularPlaces.map((place) => (
                    <PopularPlaceCard
                      key={place.place_id}
                      id={place.place_id}
                      title={place.name || "장소"}
                      description={place.address || place.city || ""}
                      image={getPopularPlaceImage(place)}
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
                <SectionMore onClick={() => router.push("/notes")}>전체 보기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {isLoadingNotes ? (
                  <>
                    <LoadingSmallCard />
                    <LoadingSmallCard />
                    <LoadingSmallCard />
                  </>
                ) : (
                  <>
                    {planningNotes.map((note, index) => (
                      <TravelNoteCard
                        key={note.trip_id}
                        tripId={note.trip_id}
                        title={getTravelNoteTitle(note)}
                        image={getTravelNoteImage(note, index)}
                      />
                    ))}
                    <AddNoteCard onClick={handleAddNewTrip}>
                      <AddNoteIconWrapper>
                        <PlusIcon />
                      </AddNoteIconWrapper>
                      <AddNoteText>새 여행</AddNoteText>
                    </AddNoteCard>
                  </>
                )}
              </HorizontalScroll>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>여행 추천</SectionTitle>
                <RefreshButton
                  onClick={handleRefreshContents}
                  $isLoading={isLoadingContents}
                  disabled={isLoadingContents}
                >
                  <RefreshIcon />
                  새로고침
                </RefreshButton>
              </SectionHeader>
              <HorizontalScroll>
                {isLoadingContents ? (
                  <>
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                  </>
                ) : travelContents.length === 0 ? (
                  <EmptyState>
                    <p>추천 여행이 없습니다.</p>
                  </EmptyState>
                ) : (
                  travelContents.map((content, index) => (
                    <TravelCard
                      key={content.content_id}
                      id={content.content_id}
                      title={content.theme_phrase}
                      description={content.city_name}
                      image={getContentImage(content, index)}
                    />
                  ))
                )}
              </HorizontalScroll>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>이벤트</SectionTitle>
              </SectionHeader>
              <HorizontalScroll>
                {TRAVEL_EVENT_CARDS.map((event) => (
                  <EventCard
                    key={event.id}
                    onClick={() => handleTravelEventClick(event.link)}
                    aria-label={`${event.title} 이벤트 이동`}
                  >
                    <EventImage src={event.image} alt={event.title} />
                    <EventOverlay />
                    <EventBadge>{event.badge}</EventBadge>
                    <EventText>
                      <EventTitle>{event.title}</EventTitle>
                      <EventSubtitle>{event.subtitle}</EventSubtitle>
                    </EventText>
                  </EventCard>
                ))}
              </HorizontalScroll>
            </Section>
          </>
        )}
      </MainContent>
      <Footer />
    </>
  );
}
