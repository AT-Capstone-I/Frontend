/**
 * AI 여행 테마 채팅 페이지
 * 
 * 주요 기능:
 * - SSE(Server-Sent Events) 스트리밍을 통한 실시간 테마 생성
 * - 사용자 쿼리 기반 여행 테마 추천
 * - 테마 선택 후 상세 콘텐츠 뷰 표시
 * 
 * API 엔드포인트:
 * - GET /api/agents/home/themes/stream - 테마 스트리밍
 * - POST /api/agents/home/themes/select - 테마 선택 및 콘텐츠 생성
 * 
 * @author MoodTrip Team
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { SSEEvent, ThemePreview, ThemeContent, ThemeSelectResponse, getUserId, getUserName } from "../lib/api";

// API Base URL
const API_BASE_URL = 'https://moodtrip-production.up.railway.app';

// 도시별 기본 이미지
const CITY_IMAGES: Record<string, string> = {
  "여수": "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=100&h=100&fit=crop",
  "서울": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=100&h=100&fit=crop",
  "제주": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=100&fit=crop",
  "부산": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=100&h=100&fit=crop",
  "강릉": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop",
  "경주": "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=100&h=100&fit=crop",
  "default": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop",
};

// Types
interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  isLoading?: boolean;
  loadingText?: string;
  themes?: ThemePreview[];
  isCompleted?: boolean;
  contentView?: ThemeContent;
}

// Styled Components - Figma Design System 적용
const ChatContainer = styled.div`
  height: 100vh;
  height: 100dvh;
  background-color: var(--primary-050, #F2F8FF);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 100%;
  }
`;

const ChatHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  background-color: var(--primary-050, #F2F8FF);
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-1100, #111112);
  width: 24px;
  height: 24px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeaderTitle = styled.h1`
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1100, #111112);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const HeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DateBadge = styled.div`
  align-self: center;
  background-color: var(--greyscale-300, #E1E1E4);
  color: var(--greyscale-800, #5E5B61);
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  margin-bottom: 4px;
`;

const MessageWrapper = styled.div<{ $isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  margin-left: ${({ $isUser }) => ($isUser ? "31px" : "0")};
  max-width: 100%;
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  display: inline-block;
  max-width: calc(100% - 40px);
  width: fit-content;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.045px;
  background-color: ${({ $isUser }) =>
    $isUser ? "var(--primary-100, #E0F0FF)" : "var(--greyscale-000, #FFFFFF)"};
  color: var(--greyscale-1200, #111111);
  word-break: keep-all;
  word-wrap: break-word;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--greyscale-900, #444246);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  padding: 4px 0;

  svg {
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const CompletedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-500, #4F9DE8);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  padding: 4px 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Figma 디자인에 맞춘 테마 카드 스타일
const ThemeCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  width: 280px;
  padding: 14px;
  background-color: var(--greyscale-000, #FFFFFF);
  border-radius: 12px;
  overflow: hidden;
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const ThemeItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${({ $disabled }) => ($disabled ? 0.6 : 0.8)};
  }
`;

const ThemeImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--greyscale-200, #F1F1F1);
`;

const ThemeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 41px;
  justify-content: center;
  flex: 1;
  min-width: 0;
`;

const ThemeCityName = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2B2A2C);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const ThemeDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  color: var(--greyscale-600, #918E94);
  transition: color 0.2s ease;

  &:hover {
    color: var(--greyscale-900, #444246);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

// 콘텐츠 뷰 스타일
const ContentViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  background-color: var(--greyscale-000, #FFFFFF);
  border-radius: 16px;
  overflow: hidden;
  margin-top: 12px;
`;

const ContentHeader = styled.div`
  padding: 16px;
  background: linear-gradient(135deg, var(--primary-100, #E0F0FF) 0%, var(--primary-050, #F2F8FF) 100%);
`;

const ContentTitle = styled.h2`
  font-family: 'Pretendard', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--greyscale-1100, #111112);
  margin: 0 0 4px 0;
`;

const ContentSubtitle = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-700, #77747B);
  margin: 0;
`;

const ImageCarousel = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CarouselImageItem = styled.div`
  flex-shrink: 0;
  scroll-snap-align: start;
`;

const CarouselImage = styled.img`
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  background-color: var(--greyscale-200, #F1F1F1);
`;

const CarouselImageLabel = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--greyscale-800, #5E5B61);
  margin: 4px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const ContentBody = styled.div`
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const ContentText = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--greyscale-900, #444246);

  p {
    margin: 0 0 12px 0;
  }

  strong {
    font-weight: 700;
    color: var(--greyscale-1100, #111112);
  }
`;

const PlaceCard = styled.div`
  background-color: var(--primary-050, #F2F8FF);
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
`;

const PlaceTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--greyscale-1100, #111112);
  margin: 0 0 4px 0;
`;

const PlaceSubtitle = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-700, #77747B);
  margin: 0 0 8px 0;
`;

const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlaceInfoItem = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-800, #5E5B61);
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;

const ContentActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--greyscale-200, #F1F1F1);
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $primary }) => $primary ? `
    background-color: var(--primary-500, #4F9DE8);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--primary-400, #66B2FE);
    }
  ` : `
    background-color: transparent;
    color: var(--greyscale-700, #77747B);
    border: 1px solid var(--greyscale-300, #E1E1E4);
    
    &:hover {
      background-color: var(--greyscale-100, #F8F8F8);
    }
  `}
`;

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 12px 20px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background-color: var(--greyscale-000, #FFFFFF);
  border-top: 1px solid var(--greyscale-300, #E1E1E4);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--greyscale-200, #F2F1F2);
  border-radius: 20px;
  padding: 10px 16px;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--greyscale-1100, #111112);
  outline: none;

  &::placeholder {
    color: var(--greyscale-600, #918E94);
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--primary-500, #4F9DE8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:disabled {
    color: var(--greyscale-400, #C4C2C6);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--primary-400, #66B2FE);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const LoadingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// 로딩 메시지 ID 상수
const LOADING_MESSAGE_ID = -999;

// 도시 이미지 가져오기 헬퍼
const getCityImage = (cityName: string): string => {
  // 도시명에서 첫 번째 단어만 추출 (예: "서울 영등포구" -> "서울")
  const mainCity = cityName.split(' ')[0];
  return CITY_IMAGES[mainCity] || CITY_IMAGES["default"];
};

// 콘텐츠 텍스트 파싱 헬퍼
const parseContentText = (text: string) => {
  const sections = text.split(/\*\*(\d+)\.\s*([^*]+)\*\*/g);
  const places: { number: string; name: string; content: string }[] = [];
  
  // 인트로 텍스트
  const intro = sections[0]?.split('---')[0]?.trim() || '';
  
  // 각 장소 파싱
  for (let i = 1; i < sections.length; i += 3) {
    if (sections[i] && sections[i + 1]) {
      const number = sections[i];
      const name = sections[i + 1].trim();
      const content = sections[i + 2]?.split('**')[0]?.trim() || '';
      places.push({ number, name, content });
    }
  }
  
  return { intro, places: places.slice(0, 5) }; // 최대 5개만 표시
};

export default function ChatPage() {
  const router = useRouter();
  const chatContentRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // 스트리밍 상태 추적용 ref
  const streamStateRef = useRef({
    assistantMessageCount: 0,
    themesDisplayed: false,
  });
  
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "장소 추천을 받으시거나, 여행을 계획하고 싶으시다면 편하게 말씀해주세요!",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingTheme, setIsSelectingTheme] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    const name = getUserName();
    setUserName(name);
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  // 컴포넌트 언마운트 시 EventSource 정리
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 로딩 메시지 업데이트 헬퍼
  const updateLoadingMessage = useCallback((text: string) => {
    setMessages((prev) => {
      const hasLoading = prev.some(m => m.id === LOADING_MESSAGE_ID);
      if (hasLoading) {
        return prev.map(m => 
          m.id === LOADING_MESSAGE_ID 
            ? { ...m, content: text, loadingText: text }
            : m
        );
      } else {
        return [
          ...prev,
          {
            id: LOADING_MESSAGE_ID,
            type: "ai" as const,
            content: text,
            isLoading: true,
            loadingText: text,
          }
        ];
      }
    });
  }, []);

  // 로딩 메시지 제거 헬퍼
  const removeLoadingMessage = useCallback(() => {
    setMessages((prev) => prev.filter(m => m.id !== LOADING_MESSAGE_ID));
  }, []);

  const startThemeStream = useCallback((query: string) => {
    // 상태 초기화
    streamStateRef.current = {
      assistantMessageCount: 0,
      themesDisplayed: false,
    };

    // 새로운 trip_id 생성
    const tripId = crypto.randomUUID();
    setCurrentTripId(tripId);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('currentTripId', tripId);

    const userId = getUserId();

    // URL 구성
    const params = new URLSearchParams({
      trip_id: tripId,
      user_query: query,
    });
    
    if (userId) {
      params.append('user_id', userId);
    }

    const url = `${API_BASE_URL}/api/agents/home/themes/stream?${params.toString()}`;

    // 기존 연결 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      // [DONE] 처리
      if (event.data === '[DONE]') {
        eventSource.close();
        removeLoadingMessage();
        setIsProcessing(false);
        return;
      }

      try {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'assistant_message':
            // assistant_message 카운트 증가
            streamStateRef.current.assistantMessageCount += 1;
            
            // 로딩 제거하고 AI 메시지 추가
            setMessages((prev) => {
              const filtered = prev.filter(m => m.id !== LOADING_MESSAGE_ID);
              return [
                ...filtered,
                {
                  id: Date.now(),
                  type: "ai",
                  content: data.content || '',
                }
              ];
            });
            
            // 첫 번째 assistant_message 후: "검색 중..." 로딩
            // 두 번째 assistant_message 후: "테마 생성 중..." 로딩
            setTimeout(() => {
              if (streamStateRef.current.assistantMessageCount === 1) {
                updateLoadingMessage("장소를 검색하는 중...");
              } else {
                updateLoadingMessage("여행지를 바탕으로 테마를 생성하는 중입니다...");
              }
            }, 100);
            break;

          case 'search_status':
            // 검색 상태 업데이트 (로딩 텍스트만 변경)
            updateLoadingMessage(`${data.count}개 장소를 찾았어요...`);
            break;

          case 'themes_ready':
          case 'result':
            // 이미 테마를 표시했으면 무시
            if (streamStateRef.current.themesDisplayed) {
              break;
            }

            // theme_phrase가 있는 테마만 필터링
            const validThemes = data.themes?.filter(t => t.theme_phrase) || [];
            
            // 유효한 테마가 있을 때만 표시
            if (validThemes.length > 0) {
              streamStateRef.current.themesDisplayed = true;
              
              setMessages((prev) => {
                // 로딩 메시지 제거
                const filtered = prev.filter(m => m.id !== LOADING_MESSAGE_ID);
                return [
                  ...filtered,
                  {
                    id: Date.now(),
                    type: "ai",
                    content: userName 
                      ? `${userName} 님의 요청에 맞춰서 여행 테마를 만들어봤어요.\n원하시는 테마를 고르시거나, 변경하고 싶다면 말씀해주세요.`
                      : "요청에 맞춰서 여행 테마를 만들어봤어요.\n원하시는 테마를 고르시거나, 변경하고 싶다면 말씀해주세요.",
                    themes: validThemes,
                  }
                ];
              });
            }
            break;

          case 'complete':
            removeLoadingMessage();
            setIsProcessing(false);
            break;

          case 'error':
            setMessages((prev) => {
              const filtered = prev.filter(m => m.id !== LOADING_MESSAGE_ID);
              return [
                ...filtered,
                {
                  id: Date.now(),
                  type: "ai",
                  content: `❌ ${data.message || '알 수 없는 에러가 발생했어요. 다시 시도해주세요.'}`,
                }
              ];
            });
            setIsProcessing(false);
            break;
        }
      } catch (e) {
        console.error('SSE 파싱 에러:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE 연결 에러:', err);
      eventSource.close();
      removeLoadingMessage();
      setIsProcessing(false);
      
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== LOADING_MESSAGE_ID);
        return [
          ...filtered,
          {
            id: Date.now(),
            type: "ai",
            content: "❌ 연결이 끊어졌습니다. 다시 시도해주세요.",
          }
        ];
      });
    };
  }, [userName, updateLoadingMessage, removeLoadingMessage]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue("");
    setIsProcessing(true);
    setIsSelectingTheme(false); // 새 쿼리 시 테마 선택 상태 초기화

    // 초기 로딩 메시지 추가 후 SSE 시작
    updateLoadingMessage("여행지를 바탕으로 테마를 생성하는 중입니다...");
    
    // SSE 스트리밍 시작
    setTimeout(() => {
      startThemeStream(query);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleThemeSelect = async (theme: ThemePreview) => {
    // 중복 요청 방지
    if (!currentTripId || isSelectingTheme) return;

    setIsSelectingTheme(true);
    updateLoadingMessage("콘텐츠를 생성하는 중...");

    try {
      // 테마 선택 API 호출
      const response = await fetch(`${API_BASE_URL}/api/agents/home/themes/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: currentTripId,
          theme_index: theme.index,
        })
      });

      if (response.ok) {
        const data: ThemeSelectResponse = await response.json();
        
        removeLoadingMessage();
        
        // 콘텐츠 뷰 메시지 추가
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "ai",
            content: `"${theme.theme_phrase}" 테마를 선택하셨어요! 🎉`,
            contentView: data.content,
          }
        ]);
      } else {
        throw new Error('API 요청 실패');
      }
    } catch (error) {
      console.error('테마 선택 에러:', error);
      removeLoadingMessage();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "ai",
          content: "❌ 테마 선택 중 에러가 발생했어요. 다시 시도해주세요.",
        }
      ]);
      // 에러 시에만 다시 선택 가능하도록
      setIsSelectingTheme(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, "0")}. ${String(today.getDate()).padStart(2, "0")}`;
  };

  // 콘텐츠 뷰 렌더링
  const renderContentView = (contentView: ThemeContent) => {
    const { intro, places } = parseContentText(contentView.content_text);
    const uniqueImages = contentView.carousel_images
      .filter((img, index, self) => 
        index === self.findIndex(i => i.place_name === img.place_name)
      )
      .slice(0, 6);

    return (
      <ContentViewWrapper>
        <ContentHeader>
          <ContentTitle>{contentView.theme_phrase}</ContentTitle>
          <ContentSubtitle>📍 {contentView.city_name}</ContentSubtitle>
        </ContentHeader>

        {uniqueImages.length > 0 && (
          <ImageCarousel>
            {uniqueImages.map((img, idx) => (
              <CarouselImageItem key={idx}>
                <CarouselImage src={img.image_url} alt={img.place_name} />
                <CarouselImageLabel>{img.place_name}</CarouselImageLabel>
              </CarouselImageItem>
            ))}
          </ImageCarousel>
        )}

        <ContentBody>
          {intro && (
            <ContentText>
              <p>{intro}</p>
            </ContentText>
          )}

          {places.map((place, idx) => (
            <PlaceCard key={idx}>
              <PlaceTitle>{place.number}. {place.name}</PlaceTitle>
              {place.content && (
                <PlaceInfo>
                  {place.content.split('\n').filter(line => line.trim()).slice(0, 3).map((line, lineIdx) => (
                    <PlaceInfoItem key={lineIdx}>
                      {line.replace(/^>\s*/, '').replace(/📌.*/, '').trim()}
                    </PlaceInfoItem>
                  ))}
                </PlaceInfo>
              )}
            </PlaceCard>
          ))}
        </ContentBody>

        <ContentActions>
          <ActionButton onClick={() => setIsSelectingTheme(false)}>
            뒤로가기
          </ActionButton>
          <ActionButton $primary onClick={() => router.push('/schedule')}>
            일정 만들기
          </ActionButton>
        </ContentActions>
      </ContentViewWrapper>
    );
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <BackButton onClick={() => router.back()}>
          <BackIcon />
        </BackButton>
        <HeaderTitle>MoodTrip</HeaderTitle>
        <HeaderSpacer />
      </ChatHeader>

      <ChatContent ref={chatContentRef}>
        <DateBadge>{getTodayDate()}</DateBadge>

        {messages.map((message) => (
          <MessageWrapper key={message.id} $isUser={message.type === "user"}>
            {message.isLoading ? (
              <LoadingMessage>
                <LoadingIcon />
                {message.loadingText || message.content}
              </LoadingMessage>
            ) : message.isCompleted ? (
              <CompletedMessage>
                <CheckIcon />
                {message.content}
              </CompletedMessage>
            ) : message.contentView ? (
              <>
                <MessageBubble $isUser={false}>
                  {message.content}
                </MessageBubble>
                {renderContentView(message.contentView)}
              </>
            ) : message.themes && message.themes.length > 0 ? (
              <>
                <MessageBubble $isUser={false}>
                  {message.content}
                </MessageBubble>
                <ThemeCardWrapper style={{ marginTop: '12px' }}>
                  <ThemeList>
                    {message.themes.slice(0, 3).map((theme) => (
                      <ThemeItem 
                        key={theme.index} 
                        $disabled={isSelectingTheme}
                        onClick={() => handleThemeSelect(theme)}
                      >
                        <ThemeImage 
                          src={getCityImage(theme.city_name)} 
                          alt={theme.city_name}
                        />
                        <ThemeInfo>
                          <ThemeCityName>{theme.city_name}</ThemeCityName>
                          <ThemeDescription>{theme.theme_phrase}</ThemeDescription>
                        </ThemeInfo>
                      </ThemeItem>
                    ))}
                  </ThemeList>
                  {message.themes.length > 3 && (
                    <MoreButton>
                      <ChevronDownIcon />
                    </MoreButton>
                  )}
                </ThemeCardWrapper>
              </>
            ) : (
              <MessageBubble $isUser={message.type === "user"}>
                {message.content}
              </MessageBubble>
            )}
          </MessageWrapper>
        ))}
      </ChatContent>

      <InputContainer>
        <InputWrapper>
          <TextInput
            type="text"
            placeholder="어떤 여행을 계획하고 계신가요?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
          />
          <SendButton onClick={handleSendMessage} disabled={!inputValue.trim() || isProcessing}>
            <SendIcon />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
}
