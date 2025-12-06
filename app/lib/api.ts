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
  theme_phrase: string | null;  // 클러스터링 완료 시 null, 라벨링 완료 시 값 존재
  place_count: number;
  place_ids: string[];
  places_preview: string[];     // 장소명 미리보기 (최대 3개)
  representative_image: string | null;  // 테마 대표 이미지 URL
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
  // assistant_message 필드
  content?: string;
  is_searching?: boolean;       // 웹 검색 진행 여부
  search_query?: string;        // 검색 중일 때만 포함 (검색어)
  // search_status 필드
  count?: number;
  // themes_ready, result 필드
  themes?: ThemePreview[];
  // clarifier_questions 필드
  questions?: ClarifierQuestion[];
  // result 필드
  status?: string;
  // error 필드
  message?: string;
  // 공통 필드
  trip_id?: string;
  timestamp: string;
}

// ============ 테마 선택 응답 타입 정의 ============

export interface CarouselImage {
  place_name: string;
  place_id: string;
  image_url: string;
}

export interface Reference {
  title: string;
  url: string;
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
  references?: Reference[];
}

export interface ThemeSelectResponse {
  status: string;
  trip_id: string;
  content: ThemeContent;
}

// ============ Clarifier API 타입 정의 ============

export interface ClarifierQuestionItem {
  index: number;
  category: string;
  question: string;
  priority: 'high' | 'medium' | 'low';
  field_name: string;
}

export interface SkipButton {
  label: string;
  description: string;
}

export interface ClarifierData {
  type: string;
  questions: ClarifierQuestionItem[];
  total_count: number;
  skip_button: SkipButton;
}

export interface ContentActionResponse {
  status: 'clarifier_asking';
  trip_id: string;
  clarifier: ClarifierData;
}

export interface ClarifierAnswerRequest {
  trip_id: string;
  answers: Record<string, string>;
  skipped: boolean;
}

export interface ClarifierAnswerResponse {
  status: 'completed';
  trip_id: string;
  user_profile_summary: string;
  clarification_answers: Record<string, string>;
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

// ============ Clarifier API 함수 ============

/**
 * 콘텐츠 액션 API - "여기로 결정하기" 클릭 시 호출
 * Clarifier 질문들을 받아옴
 */
export async function requestContentAction(tripId: string): Promise<ContentActionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agents/home/content/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trip_id: tripId,
      action: 'go'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '요청 실패');
  }

  return response.json();
}

/**
 * Clarifier 답변 제출 API
 * 질문에 대한 답변 또는 건너뛰기 처리
 */
export async function submitClarifierAnswer(
  tripId: string,
  answers: Record<string, string>,
  skipped: boolean = false
): Promise<ClarifierAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agents/home/clarifier/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trip_id: tripId,
      answers,
      skipped
    } as ClarifierAnswerRequest)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '답변 제출 실패');
  }

  return response.json();
}

