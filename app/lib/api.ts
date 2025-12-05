// API Base URL
const API_BASE_URL = 'https://moodtrip-production.up.railway.app';

// ============ 온보딩 타입 정의 ============

export interface OnboardingAnswer {
  question_id: number;
  selected_option: number;
}

export interface OnboardingRequest {
  user_name: string;
  answers: OnboardingAnswer[];
  user_id?: string | null;
}

export interface OnboardingResponse {
  user_id: string;
  user_name: string;
  success: boolean;
}

// ============ 장소 추천 타입 정의 ============

export interface PlaceRecommendation {
  place_id: string;
  name: string | null;
  city: string | null;
  category: string | null;
  rating: number | null;
  summary: Record<string, string> | null;
  description: string | null;
  photos: string[];
  address: string | null;
  relevance_score: number;
  similarity_score: number;
}

export interface RecommendPlacesRequest {
  user_id: string;
  city?: string | null;
  domain?: 'place' | 'food' | 'activity' | 'unified';
  max_results?: number;
  use_rerank?: boolean;
  query?: string | null;
}

export interface RecommendPlacesResponse {
  places: PlaceRecommendation[];
  total: number;
  metadata: {
    user_id: string;
    profile_used: boolean;
    reranked: boolean;
    domain: string;
    city: string | null;
    query: string | null;
  };
}

// ============ API 함수 ============

/**
 * 온보딩 API 호출
 * @param userName 사용자 이름
 * @param answers 질문 답변 배열
 * @returns 온보딩 응답 (user_id 포함)
 */
export async function submitOnboarding(
  userName: string,
  answers: OnboardingAnswer[]
): Promise<OnboardingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agents/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_name: userName,
      answers: answers,
      user_id: null
    } as OnboardingRequest)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '온보딩 실패');
  }

  return response.json();
}

/**
 * 개인화 장소 추천 API 호출
 * @param userId 사용자 ID
 * @param city 도시명 (한글)
 * @param options 추가 옵션
 * @returns 추천 장소 목록
 */
export async function getRecommendedPlaces(
  userId: string,
  city?: string | null,
  options?: {
    domain?: 'place' | 'food' | 'activity' | 'unified';
    maxResults?: number;
    useRerank?: boolean;
    query?: string | null;
  }
): Promise<RecommendPlacesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      city: city || null,
      domain: options?.domain || 'unified',
      max_results: options?.maxResults || 5,
      use_rerank: options?.useRerank ?? true,
      query: options?.query || null
    } as RecommendPlacesRequest)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '추천 실패');
  }

  return response.json();
}

// ============ 테마 스트리밍 타입 정의 ============

export interface ThemePreview {
  index: number;
  city_name: string;
  theme_phrase: string;
  place_count: number;
  place_ids: string[];
  places_preview: string[];
}

export interface ClarifierQuestion {
  key: string;
  question: string;
  options: string[];
}

export type SSEEventType = 
  | 'assistant_message' 
  | 'search_status' 
  | 'themes_ready' 
  | 'clarifier_questions'
  | 'result' 
  | 'complete' 
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  content?: string;           // assistant_message
  count?: number;             // search_status
  themes?: ThemePreview[];    // themes_ready, result
  questions?: ClarifierQuestion[];  // clarifier_questions
  status?: string;            // result
  message?: string;           // error
  trip_id?: string;
  timestamp: string;
}

// ============ 테마 선택 응답 타입 정의 ============

export interface CarouselImage {
  place_name: string;
  place_id: string;
  image_url: string;
}

export interface ThemeContent {
  type: string;
  content_id: string;
  city_name: string;
  theme_phrase: string;
  content_text: string;
  place_ids: string[];
  carousel_images: CarouselImage[];
  needs_embedding: boolean;
  message: string;
  actions: string[];
}

export interface ThemeSelectResponse {
  status: string;
  trip_id: string;
  content: ThemeContent;
}

// ============ 로컬 스토리지 키 ============

export const STORAGE_KEYS = {
  USER_ID: 'moodtrip_user_id',
  USER_NAME: 'moodtrip_user_name',
  SIGNUP_COMPLETED: 'moodtrip_signup_completed',
  SPLASH_SHOWN: 'moodtrip_splash_shown',
} as const;

// ============ 유틸리티 함수 ============

/**
 * 사용자 ID 가져오기
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

/**
 * 사용자 이름 가져오기
 */
export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.USER_NAME);
}

/**
 * 로그아웃 (모든 사용자 데이터 삭제)
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  localStorage.removeItem(STORAGE_KEYS.SIGNUP_COMPLETED);
  sessionStorage.removeItem(STORAGE_KEYS.SPLASH_SHOWN);
}

/**
 * 로그인 상태 확인
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.SIGNUP_COMPLETED) === 'true';
}

