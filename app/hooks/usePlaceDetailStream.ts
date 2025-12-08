import { useEffect, useState, useCallback, useRef } from 'react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moodtrip-production.up.railway.app';

// ============ 타입 정의 ============

export interface Review {
  text: { text: string };
  rating: number;
  authorAttribution?: { displayName: string };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  user_ratings_total: number;
  category: string;
  photos: string[];
  reviews: Review[];
  google_maps_uri: string;
  website: string | null;
  phone: string | null;
  opening_hours: string | null;
}

export interface PlaceSummary {
  mood: string | null;
  pros: string[];
  cons: string[];
  recommended_items: string[];
  review_highlights: string[];
  ideal_for: string[];
  description: string | null;
  message?: string;
}

export interface UsePlaceDetailStreamResult {
  details: PlaceDetails | null;
  summary: PlaceSummary | null;
  isDetailsLoading: boolean;
  isSummaryLoading: boolean;
  error: string | null;
  isCached: boolean;
  refetch: () => void;
}

// ============ Hook 구현 ============

export const usePlaceDetailStream = (
  placeId: string | null
): UsePlaceDetailStreamResult => {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [summary, setSummary] = useState<PlaceSummary | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!placeId) return;

    // 초기화
    setIsDetailsLoading(true);
    setIsSummaryLoading(true);
    setDetails(null);
    setSummary(null);
    setError(null);
    setIsCached(false);

    // 기존 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // place_id에서 google_ prefix 제거 (백엔드에서 자동 처리하지만 혹시 모르니)
    const cleanPlaceId = placeId.startsWith('google_') 
      ? placeId.substring(7) 
      : placeId;

    const es = new EventSource(`${API_BASE_URL}/api/places/${cleanPlaceId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener('details', (e) => {
      try {
        const data = JSON.parse(e.data);
        setDetails(data);
        setIsDetailsLoading(false);
      } catch (err) {
        console.error('Failed to parse details:', err);
      }
    });

    es.addEventListener('summary', (e) => {
      try {
        const data = JSON.parse(e.data);
        setSummary(data);
        setIsSummaryLoading(false);
      } catch (err) {
        console.error('Failed to parse summary:', err);
      }
    });

    es.addEventListener('complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        setIsCached(data.status === 'cached');
      } catch (err) {
        console.error('Failed to parse complete:', err);
      }
      es.close();
      eventSourceRef.current = null;
    });

    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setError(data.message || '장소 정보를 불러오는데 실패했습니다.');
      } catch {
        setError('연결이 끊어졌습니다. 다시 시도해주세요.');
      }
      setIsDetailsLoading(false);
      setIsSummaryLoading(false);
      es.close();
      eventSourceRef.current = null;
    });

    // onerror 핸들러 (연결 끊김 등)
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        return;
      }
      setError('서버 연결이 끊어졌습니다.');
      setIsDetailsLoading(false);
      setIsSummaryLoading(false);
      es.close();
      eventSourceRef.current = null;
    };
  }, [placeId]);

  // placeId 변경 시 연결
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [placeId, connect]);

  // refetch 함수
  const refetch = useCallback(() => {
    connect();
  }, [connect]);

  return {
    details,
    summary,
    isDetailsLoading,
    isSummaryLoading,
    error,
    isCached,
    refetch,
  };
};

export default usePlaceDetailStream;
