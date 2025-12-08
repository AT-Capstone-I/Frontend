// API Base URL
const API_BASE_URL = "https://moodtrip-production.up.railway.app";

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
  domain?: "place" | "food" | "activity" | "unified";
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
  answers: OnboardingAnswer[],
  userId?: string | null
): Promise<OnboardingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agents/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: userName,
      answers: answers,
      user_id: userId || null,
    } as OnboardingRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "온보딩 실패");
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
    domain?: "place" | "food" | "activity" | "unified";
    maxResults?: number;
    useRerank?: boolean;
    query?: string | null;
  }
): Promise<RecommendPlacesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      city: city || null,
      domain: options?.domain || "unified",
      max_results: options?.maxResults || 5,
      use_rerank: options?.useRerank ?? true,
      query: options?.query || null,
    } as RecommendPlacesRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "추천 실패");
  }

  return response.json();
}

// ============ 테마 스트리밍 타입 정의 ============

export interface ThemePreview {
  index: number;
  city_name: string;
  theme_phrase: string | null; // 클러스터링 완료 시 null, 라벨링 완료 시 값 존재
  place_count: number;
  place_ids: string[];
  places_preview: string[]; // 장소명 미리보기 (최대 3개)
  representative_image: string | null; // 테마 대표 이미지 URL
}

export interface ClarifierQuestion {
  key: string;
  question: string;
  options: string[];
}

export type SSEEventType =
  | "assistant_message"
  | "search_status"
  | "themes_ready"
  | "clarifier_questions"
  | "result"
  | "complete"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  // assistant_message 필드
  content?: string;
  is_searching?: boolean; // 웹 검색 진행 여부
  search_query?: string; // 검색 중일 때만 포함 (검색어)
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
  latitude?: number;
  longitude?: number;
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
  priority: "high" | "medium" | "low";
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
  status: "clarifier_asking";
  trip_id: string;
  clarifier: ClarifierData;
}

// Back 액션 응답 타입 (테마 카드 목록으로 돌아갈 때)
export interface ContentActionBackResponse {
  status: "theme_cards";
  trip_id: string;
  themes: ThemePreview[];
}

export interface ClarifierAnswerRequest {
  trip_id: string;
  answers: Record<string, string>;
  skipped: boolean;
}

export interface ClarifierAnswerResponse {
  status: "completed";
  trip_id: string;
  user_profile_summary: string;
  clarification_answers: Record<string, string>;
}

// ============ Clarifier API 함수 ============

/**
 * 콘텐츠 액션 API - "여기로 결정하기" 클릭 시 호출
 * Clarifier 질문들을 받아옴
 */
export async function requestContentAction(
  tripId: string
): Promise<ContentActionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/agents/home/content/action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        action: "go",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "요청 실패");
  }

  return response.json();
}

/**
 * 콘텐츠 액션 API - "뒤로가기" 클릭 시 호출
 * 테마 카드 목록으로 돌아감 (LangGraph 인터럽트 상태 복원)
 */
export async function requestContentActionBack(
  tripId: string
): Promise<ContentActionBackResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/agents/home/content/action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        action: "back",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "뒤로가기 요청 실패");
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
  const response = await fetch(
    `${API_BASE_URL}/api/agents/home/clarifier/answer`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: tripId,
        answers,
        skipped,
      } as ClarifierAnswerRequest),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "답변 제출 실패");
  }

  return response.json();
}

// ============ 콘텐츠(여행) 추천 타입 정의 ============

export interface ContentRecommendation {
  content_id: string;
  city_name: string;
  theme_phrase: string;
  content_text: string;
  embedding_summary: string;
  place_ids: string[];
  theme_keywords?: string[];
  recommended_for?: string[];
  relevance_score: number;
  similarity_score: number;
}

export interface RecommendContentsRequest {
  user_id: string;
  query?: string;
  city?: string;
  max_results?: number;
  use_rerank?: boolean;
}

export interface RecommendContentsResponse {
  contents: ContentRecommendation[];
  total: number;
  metadata: {
    user_id: string;
    profile_used: boolean;
    reranked: boolean;
    city: string | null;
    query: string | null;
  };
}

/**
 * 콘텐츠(여행 테마) 추천 API
 * 사용자 선호도 기반 테마 콘텐츠 추천
 */
export async function getRecommendedContents(
  userId: string,
  options?: {
    query?: string;
    city?: string;
    maxResults?: number;
    useRerank?: boolean;
  }
): Promise<RecommendContentsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/recommend/contents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      query: options?.query || null,
      city: options?.city || null,
      max_results: options?.maxResults || 5,
      use_rerank: options?.useRerank ?? true,
    } as RecommendContentsRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "콘텐츠 추천 실패");
  }

  return response.json();
}

// ============ 인기 장소 추천 타입 정의 ============

export interface PopularPlace {
  place_id: string;
  name: string;
  city: string | null;
  category: string | null;
  subcategory: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  address: string | null;
  images: string[];
  description: string | null;
  weighted_score: number | null;
}

export interface PopularPlacesResponse {
  places: PopularPlace[];
  total: number;
  metadata: {
    city: string;
    city_variants: string[];
    match_type: string;
    supports_rag: boolean;
    category: string | null;
    scoring_method: string;
  };
}

export interface PopularPlacesParams {
  city: string;
  limit?: number;
  category?: string;
}

/**
 * 인기 장소 추천 API
 * 도시별 인기 장소를 가중 점수 기반으로 추천
 */
export async function getPopularPlaces(
  params: PopularPlacesParams
): Promise<PopularPlacesResponse> {
  const searchParams = new URLSearchParams({ city: params.city });
  if (params.limit) searchParams.append("limit", String(params.limit));
  if (params.category) searchParams.append("category", params.category);

  const response = await fetch(
    `${API_BASE_URL}/api/recommend/popular?${searchParams}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "인기 장소 조회 실패");
  }

  return response.json();
}

// ============ 사용자 온보딩 상태 확인 ============

export interface UserCheckResponse {
  exists: boolean;
  user_id?: string;
}

/**
 * 사용자가 이미 온보딩을 완료했는지 확인
 * 추천 API를 활용하여 프로필 존재 여부 확인
 */
export async function checkUserOnboarded(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommend/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        max_results: 1,
        use_rerank: false,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    // profile_used가 true면 온보딩 완료된 사용자
    return data.metadata?.profile_used === true;
  } catch (error) {
    console.error("사용자 확인 실패:", error);
    return false;
  }
}

// ============ 여행 노트 타입 정의 ============

export type TripStatus =
  | "conversation_only"
  | "planning"
  | "ongoing"
  | "completed";

export interface TravelNote {
  trip_id: string;
  final_city: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_status: TripStatus;
  schedule_confirmed: boolean;
  schedule_confirmed_at: string | null;
  trip_completed_at: string | null;
  selected_theme: string | null;
  selected_city: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelNotesResponse {
  conversation_only: TravelNote[];
  planning: TravelNote[];
  ongoing: TravelNote[];
  completed: TravelNote[];
  counts: {
    conversation_only: number;
    planning: number;
    ongoing: number;
    completed: number;
    total: number;
  };
}

/**
 * 여행 노트 목록 조회 API
 * @param userId 사용자 ID
 * @returns 상태별 여행 노트 목록
 */
export async function getTravelNotes(
  userId: string
): Promise<TravelNotesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/users/${userId}/travel-notes`
  );

  if (!response.ok) {
    if (response.status === 404) {
      // 사용자가 없는 경우 빈 응답 반환
      return {
        conversation_only: [],
        planning: [],
        ongoing: [],
        completed: [],
        counts: {
          conversation_only: 0,
          planning: 0,
          ongoing: 0,
          completed: 0,
          total: 0,
        },
      };
    }
    const error = await response.json();
    throw new Error(error.detail || "여행 노트 조회 실패");
  }

  return response.json();
}

// ============ 로컬 스토리지 키 ============

export const STORAGE_KEYS = {
  USER_ID: "moodtrip_user_id",
  USER_NAME: "moodtrip_user_name",
  SIGNUP_COMPLETED: "moodtrip_signup_completed",
  SPLASH_SHOWN: "moodtrip_splash_shown",
} as const;

// ============ 유틸리티 함수 ============

/**
 * 사용자 ID 가져오기
 */
export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

/**
 * 사용자 이름 가져오기
 */
export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.USER_NAME);
}

/**
 * 로그아웃 (모든 사용자 데이터 삭제)
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  localStorage.removeItem(STORAGE_KEYS.SIGNUP_COMPLETED);
  sessionStorage.removeItem(STORAGE_KEYS.SPLASH_SHOWN);
}

/**
 * 로그인 상태 확인
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.SIGNUP_COMPLETED) === "true";
}

// ============ 콘텐츠 상세 조회 타입 정의 ============

export interface ContentCarouselImage {
  place_id: string;
  name: string;
  images: string[];
}

export interface ContentDetail {
  content_id: string;
  city_name: string;
  theme_phrase: string;
  content_text: string;
  representative_image: string | null;
  carousel_images: ContentCarouselImage[];
  place_ids: string[];
  place_count: number;
  created_at: string;
}

/**
 * 콘텐츠 상세 조회 API
 * 홈 화면에서 콘텐츠(테마) 카드 클릭 시 상세 정보 조회
 */
export async function getContentDetail(
  contentId: string
): Promise<ContentDetail> {
  const response = await fetch(`${API_BASE_URL}/api/contents/${contentId}`);

  if (!response.ok) {
    throw new Error(`콘텐츠 상세 조회 실패: ${response.status}`);
  }

  return response.json();
}
