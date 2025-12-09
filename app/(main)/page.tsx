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
} from "@/app/lib/api";

// ============ sessionStorage 헬퍼 함수 ============
const STORAGE_KEYS = {
  SEEN_RECOMMENDED: "moodtrip_seen_recommended_ids",
  SEEN_POPULAR: "moodtrip_seen_popular_ids",
  SEEN_CONTENTS: "moodtrip_seen_contents_ids",
  CACHED_RECOMMENDED: "moodtrip_cached_recommended",
  CACHED_POPULAR: "moodtrip_cached_popular",
  CACHED_CONTENTS: "moodtrip_cached_contents",
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

// 기본 이미지 (사진이 없을 때 사용)
const DEFAULT_PLACE_IMAGE =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=300&fit=crop";

// 여행 노트 기본 이미지 (도시별)
const TRAVEL_NOTE_DEFAULT_IMAGES: Record<string, string> = {
  여수: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=400&fit=crop",
  전주: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=400&fit=crop",
  제주: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=400&fit=crop",
  부산: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=400&fit=crop",
  서울: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=400&fit=crop",
  경주: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=400&fit=crop",
  강릉: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=400&fit=crop",
  대전: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=400&fit=crop",
  default:
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=400&fit=crop",
};

// 여행 콘텐츠 기본 이미지 (도시별)
const TRAVEL_DEFAULT_IMAGES: Record<string, string> = {
  여수: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=300&fit=crop",
  전주: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=300&fit=crop",
  제주: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
  부산: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=300&fit=crop",
  서울: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=400&h=300&fit=crop",
  경주: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=300&fit=crop",
  default:
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=300&fit=crop",
};

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
        const result = await getRecommendedPlaces(userId, "경기 안성시", {
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

          // 필터링 후 장소가 없으면 캐시 초기화하고 전체 반환
          if (newPlaces.length === 0) {
            clearSeenIds(STORAGE_KEYS.SEEN_RECOMMENDED);
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
    []
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
        city: "안성",
        limit: limit,
      });

      let newPlaces = result.places;
      const seenIds = getSeenIds(STORAGE_KEYS.SEEN_POPULAR);

      // 새로고침인 경우, 이전에 본 장소 제외
      if (isRefresh && seenIds.size > 0) {
        newPlaces = result.places.filter(
          (place) => !seenIds.has(place.place_id)
        );

        if (newPlaces.length === 0) {
          clearSeenIds(STORAGE_KEYS.SEEN_POPULAR);
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
  }, []);

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

          if (newContents.length === 0) {
            clearSeenIds(STORAGE_KEYS.SEEN_CONTENTS);
            newContents = result.contents;
          }
        }

        newContents = newContents.slice(0, 5);

        newContents.forEach((content) => seenIds.add(content.content_id));
        saveSeenIds(STORAGE_KEYS.SEEN_CONTENTS, seenIds);

        // 현재 콘텐츠를 캐시에 저장
        cacheContents(STORAGE_KEYS.CACHED_CONTENTS, newContents);

        setTravelContents(newContents);
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

  // 초기 로딩
  useEffect(() => {
    const name = getUserName();
    setUserName(name);

    fetchRecommendedPlaces(false);
    fetchPopularPlaces(false);
    fetchTravelContents(false);
    fetchPlanningNotes();
  }, [
    fetchRecommendedPlaces,
    fetchPopularPlaces,
    fetchTravelContents,
    fetchPlanningNotes,
  ]);

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

  // 콘텐츠 이미지 가져오기 (도시별 기본 이미지)
  const getContentImage = (content: ContentRecommendation): string => {
    const cityName = content.city_name || "";
    return TRAVEL_DEFAULT_IMAGES[cityName] || TRAVEL_DEFAULT_IMAGES["default"];
  };

  // 여행 노트 이미지 가져오기 (도시별 기본 이미지)
  const getTravelNoteImage = (note: TravelNote): string => {
    const cityName = note.final_city || note.selected_city || "";
    return (
      TRAVEL_NOTE_DEFAULT_IMAGES[cityName] ||
      TRAVEL_NOTE_DEFAULT_IMAGES["default"]
    );
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
                    {planningNotes.map((note) => (
                      <TravelNoteCard
                        key={note.trip_id}
                        tripId={note.trip_id}
                        title={getTravelNoteTitle(note)}
                        image={getTravelNoteImage(note)}
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
                  travelContents.map((content) => (
                    <TravelCard
                      key={content.content_id}
                      id={content.content_id}
                      title={content.theme_phrase}
                      description={content.city_name}
                      image={getContentImage(content)}
                    />
                  ))
                )}
              </HorizontalScroll>
            </Section>
          </>
        )}
      </MainContent>
      <Footer />
    </>
  );
}
