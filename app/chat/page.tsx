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

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import {
  SSEEvent,
  ThemePreview,
  ThemeContent,
  ThemeSelectResponse,
  getUserId,
  getUserName,
  requestContentAction,
  requestContentActionBack,
  submitClarifierAnswer,
  ClarifierData,
  ClarifierQuestionItem,
} from "../lib/api";

// API Base URL
const API_BASE_URL = "https://moodtrip-production.up.railway.app";

// 도시별 기본 이미지
const CITY_IMAGES: Record<string, string> = {
  여수: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=100&h=100&fit=crop",
  서울: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=100&h=100&fit=crop",
  제주: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=100&fit=crop",
  부산: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=100&h=100&fit=crop",
  강릉: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop",
  경주: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=100&h=100&fit=crop",
  default:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop",
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
}

// Styled Components - Figma Design System 적용
const ChatContainer = styled.div`
  height: 100vh;
  height: 100dvh;
  background-color: var(--primary-050, #f2f8ff);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  position: relative;

  @media (min-width: 768px) {
    max-width: 100%;
  }
`;

// Clarifier 오버레이
const ClarifierOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--greyscale-000, #ffffff);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const ClarifierContainer = styled.div`
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: var(--greyscale-000, #ffffff);
  display: flex;
  flex-direction: column;
`;

const ClarifierTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  height: 50px;
`;

const ClarifierBackButton = styled.button<{ disabled?: boolean }>`
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: ${({ disabled }) =>
    disabled
      ? "var(--greyscale-400, #C4C2C6)"
      : "var(--greyscale-1100, #111112)"};
`;

const ClarifierSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ClarifierContentWrapper = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const ClarifierQuestionNumber = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.042px;
  color: var(--primary-500, #4f9de8);
  margin-bottom: 8px;
`;

const ClarifierTitle = styled.h1`
  font-family: "Pretendard", sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.132px;
  color: var(--greyscale-1100, #111112);
  margin-bottom: 28px;
`;

const ClarifierTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: var(--greyscale-1100, #111112);
  resize: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: var(--greyscale-500, #aaa8ad);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-500, #4f9de8);
    box-shadow: 0 0 0 3px rgba(79, 157, 232, 0.1);
  }
`;

const ClarifierPageIndicator = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-400, #c4c2c6);
  text-align: center;
  margin-top: auto;
  margin-bottom: 20px;
`;

const ClarifierBottomBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 18px 34px;
  background-color: var(--greyscale-000, #ffffff);
  box-shadow: 0px -3px 8px rgba(0, 0, 0, 0.06);
`;

const ClarifierButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const ClarifierNextButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  height: 56px;
  border: none;
  border-radius: 12px;
  background-color: ${({ $isActive }) =>
    $isActive
      ? "var(--greyscale-900, #444246)"
      : "var(--greyscale-300, #E1E1E4)"};
  color: var(--greyscale-000, #ffffff);
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: ${({ $isActive }) => ($isActive ? "pointer" : "not-allowed")};
  transition: background-color 0.2s ease;
`;

const ClarifierSkipAllButton = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 12px 20px;
  background-color: ${({ $isActive }) =>
    $isActive
      ? "var(--greyscale-200, #f2f1f2)"
      : "var(--greyscale-100, #f8f8f8)"};
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: ${({ $isActive }) =>
    $isActive
      ? "var(--greyscale-700, #77747b)"
      : "var(--greyscale-400, #c4c2c6)"};
  cursor: ${({ $isActive }) => ($isActive ? "pointer" : "not-allowed")};
  transition: all 0.2s ease;
`;

// ============ 날짜 선택 캘린더 스타일 ============

const DatePickerWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const MonthTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const MonthNavigation = styled.div`
  display: flex;
  gap: 8px;
`;

const MonthNavButton = styled.button`
  width: 32px;
  height: 32px;
  background-color: var(--greyscale-100, #f7f7f7);
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-200, #f2f1f2);
  }

  svg {
    width: 16px;
    height: 16px;
    color: var(--greyscale-1200, #111111);
  }
`;

const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
`;

const DayLabel = styled.span`
  width: calc(100% / 7);
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--greyscale-600, #918e94);
  text-align: center;
`;

const WeekRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DayCellWrapper = styled.div<{
  $inRange?: boolean;
  $isStart?: boolean;
  $isEnd?: boolean;
  $isStartAndEnd?: boolean;
}>`
  width: calc(100% / 7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 40px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${({ $isStart }) => ($isStart ? "50%" : "0")};
    right: ${({ $isEnd }) => ($isEnd ? "50%" : "0")};
    background-color: ${({ $inRange, $isStart, $isEnd, $isStartAndEnd }) =>
      $isStartAndEnd
        ? "transparent"
        : $inRange || $isStart || $isEnd
        ? "var(--primary-050, #F2F8FF)"
        : "transparent"};
    z-index: 0;
  }
`;

const DayCell = styled.button<{
  $selected?: boolean;
  $disabled?: boolean;
  $isPast?: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background-color: ${({ $selected }) =>
    $selected ? "var(--primary-400, #66B2FE)" : "transparent"};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $selected, $disabled, $isPast }) =>
    $selected
      ? "white"
      : $disabled || $isPast
      ? "var(--greyscale-400, #C4C2C6)"
      : "var(--greyscale-1200, #111111)"};
  cursor: ${({ $disabled, $isPast }) =>
    $disabled || $isPast ? "default" : "pointer"};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ $selected, $disabled, $isPast }) =>
      $disabled || $isPast
        ? "transparent"
        : $selected
        ? "var(--primary-400, #66B2FE)"
        : "var(--primary-050, #F2F8FF)"};
  }
`;

const DateSummary = styled.div`
  background-color: var(--greyscale-100, #f1f1f1);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  margin-bottom: 20px;
`;

const DateSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const DateSummaryLabel = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: var(--greyscale-700, #77747b);
`;

const DateSummaryValue = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--greyscale-1000, #2b2a2c);
`;

// 전체 화면 로딩 오버레이
const FullScreenLoading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 100;
  backdrop-filter: blur(2px);
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--primary-100, #e0f0ff);
  border-top-color: var(--primary-500, #4f9de8);
  border-radius: 50%;
  animation: spinLoader 1s linear infinite;

  @keyframes spinLoader {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingOverlayText = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: center;

  background: linear-gradient(
    90deg,
    var(--greyscale-700, #77747b) 0%,
    var(--greyscale-1000, #2b2a2c) 50%,
    var(--greyscale-700, #77747b) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerText 2s ease-in-out infinite;

  @keyframes shimmerText {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const LoadingSubText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-600, #918e94);
  margin: 0;
`;

const ChatHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  background-color: var(--primary-050, #f2f8ff);
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

const HeaderLogo = styled.img`
  height: 20px;
  width: auto;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const HeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 22px;
    height: 22px;
    color: var(--greyscale-700, #77747b);
  }
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
  background-color: var(--greyscale-300, #e1e1e4);
  color: var(--greyscale-800, #5e5b61);
  padding: 4px 12px;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
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
  font-family: "Pretendard", sans-serif;
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
  font-family: "Pretendard", sans-serif;
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

// 애니메이션 텍스트 컴포넌트 (펄스 효과)
const AnimatedText = styled.span`
  background: linear-gradient(
    90deg,
    var(--greyscale-600, #918e94) 0%,
    var(--greyscale-900, #444246) 50%,
    var(--greyscale-600, #918e94) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const CompletedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-500, #4f9de8);
  font-family: "Pretendard", sans-serif;
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
  background-color: var(--greyscale-000, #ffffff);
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
  background-color: var(--greyscale-200, #f1f1f1);
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
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2b2a2c);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
`;

const ThemeDescription = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747b);
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
  color: var(--greyscale-600, #918e94);
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
  background-color: var(--greyscale-000, #ffffff);
  border-radius: 16px;
  overflow: hidden;
  margin-top: 12px;
`;

const ContentHeader = styled.div`
  padding: 16px;
  background: linear-gradient(
    135deg,
    var(--primary-100, #e0f0ff) 0%,
    var(--primary-050, #f2f8ff) 100%
  );
`;

const ContentTitle = styled.h2`
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--greyscale-1100, #111112);
  margin: 0 0 4px 0;
`;

const ContentSubtitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-700, #77747b);
  margin: 0;
`;

const ImageCarousel = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
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
  background-color: var(--greyscale-200, #f1f1f1);
`;

const CarouselImageLabel = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: var(--greyscale-800, #5e5b61);
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
  font-family: "Pretendard", sans-serif;
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
  background-color: var(--primary-050, #f2f8ff);
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
`;

const PlaceTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--greyscale-1100, #111112);
  margin: 0 0 4px 0;
`;

const PlaceSubtitle = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-700, #77747b);
  margin: 0 0 8px 0;
`;

const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlaceInfoItem = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-800, #5e5b61);
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 4px;
`;

const ContentActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--greyscale-200, #f1f1f1);
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $primary }) =>
    $primary
      ? `
    background-color: var(--primary-500, #4F9DE8);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--primary-400, #66B2FE);
    }
  `
      : `
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
  background-color: var(--greyscale-000, #ffffff);
  border-top: 1px solid var(--greyscale-300, #e1e1e4);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--greyscale-200, #f2f1f2);
  border-radius: 20px;
  padding: 10px 16px;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--greyscale-1100, #111112);
  outline: none;

  &::placeholder {
    color: var(--greyscale-600, #918e94);
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--primary-500, #4f9de8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:disabled {
    color: var(--greyscale-400, #c4c2c6);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--primary-400, #66b2fe);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StopButton = styled.button`
  background: var(--error-100, #ffe5e5);
  border: none;
  cursor: pointer;
  padding: 6px;
  color: var(--error-500, #e85050);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: var(--error-200, #ffcccc);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 18px;
    height: 18px;
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

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ResetIcon = () => (
  <img src="/assets/icons/reset.svg" alt="초기화" width={24} height={24} />
);

// 로딩 메시지 ID 상수
const LOADING_MESSAGE_ID = -999;

// 채팅 저장 키
const CHAT_STORAGE_KEY = "moodtrip_chat_messages";
const TRIP_ID_STORAGE_KEY = "moodtrip_current_trip_id";

// 채팅 메시지 저장
const saveChatMessages = (messages: Message[]) => {
  if (typeof window === "undefined") return;
  // 로딩 메시지는 저장하지 않음
  const messagesToSave = messages.filter(
    (m) => m.id !== LOADING_MESSAGE_ID && !m.isLoading
  );
  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
};

// 채팅 메시지 복원
const loadChatMessages = (): Message[] | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

// 채팅 메시지 초기화
const clearChatMessages = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHAT_STORAGE_KEY);
  sessionStorage.removeItem(TRIP_ID_STORAGE_KEY);
};

// Trip ID 저장/복원
const saveTripId = (tripId: string | null) => {
  if (typeof window === "undefined") return;
  if (tripId) {
    sessionStorage.setItem(TRIP_ID_STORAGE_KEY, tripId);
  } else {
    sessionStorage.removeItem(TRIP_ID_STORAGE_KEY);
  }
};

const loadTripId = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TRIP_ID_STORAGE_KEY);
};

// 콘텐츠 선택 상태 저장 키
const HAS_SELECTED_CONTENT_KEY = "moodtrip_has_selected_content";

// 콘텐츠 선택 상태 저장 (재선택 시 back API 호출 여부 결정)
const saveHasSelectedContent = (value: boolean) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HAS_SELECTED_CONTENT_KEY, JSON.stringify(value));
};

// 콘텐츠 선택 상태 복원
const loadHasSelectedContent = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = sessionStorage.getItem(HAS_SELECTED_CONTENT_KEY);
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

// 콘텐츠 선택 상태 초기화
const clearHasSelectedContent = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(HAS_SELECTED_CONTENT_KEY);
};

// 테마 이미지 가져오기 헬퍼 (representative_image 우선 사용)
const getThemeImage = (theme: ThemePreview): string => {
  // 백엔드에서 제공하는 대표 이미지가 있으면 사용
  if (theme.representative_image) {
    return theme.representative_image;
  }
  // 없으면 도시명 기반 기본 이미지 사용
  const mainCity = theme.city_name.split(" ")[0];
  return CITY_IMAGES[mainCity] || CITY_IMAGES["default"];
};

// 콘텐츠 텍스트 파싱 헬퍼
const parseContentText = (text: string) => {
  const sections = text.split(/\*\*(\d+)\.\s*([^*]+)\*\*/g);
  const places: { number: string; name: string; content: string }[] = [];

  // 인트로 텍스트
  const intro = sections[0]?.split("---")[0]?.trim() || "";

  // 각 장소 파싱
  for (let i = 1; i < sections.length; i += 3) {
    if (sections[i] && sections[i + 1]) {
      const number = sections[i];
      const name = sections[i + 1].trim();
      const content = sections[i + 2]?.split("**")[0]?.trim() || "";
      places.push({ number, name, content });
    }
  }

  return { intro, places: places.slice(0, 5) }; // 최대 5개만 표시
};

// 대화 기록에 trip_id 추가 (Fire-and-forget)
const addToConversationHistory = async (userId: string, tripId: string) => {
  try {
    await fetch(`${API_BASE_URL}/api/users/${userId}/conversations/${tripId}`, {
      method: "POST",
    });
    console.log("✅ Trip added to conversation history");
  } catch (error) {
    // 실패해도 UX에 영향 없음 - 조용히 로깅만
    console.warn("⚠️ Failed to add trip to history:", error);
  }
};

const SuspenseFallback = () => (
  <ChatContainer>
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "24px",
      }}
    >
      <LoadingSpinner />
      <p
        style={{
          margin: 0,
          fontFamily: "Pretendard, sans-serif",
          fontSize: "15px",
          color: "var(--greyscale-800, #5e5b61)",
        }}
      >
        채팅을 준비하고 있어요...
      </p>
    </div>
  </ChatContainer>
);

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatContentRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasAddedToHistoryRef = useRef(false);
  const hasHandledReturnRef = useRef(false);

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
      content:
        "장소 추천을 받으시거나, 여행을 계획하고 싶으시다면 편하게 말씀해주세요!",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingTheme, setIsSelectingTheme] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ThemeContent | null>(
    null
  );
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());
  const [showClarifier, setShowClarifier] = useState(false);
  const [clarifierData, setClarifierData] = useState<ClarifierData | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmittingClarifier, setIsSubmittingClarifier] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("처리 중...");
  const [overlaySubtitle, setOverlaySubtitle] = useState("잠시만 기다려주세요");

  // 이전에 콘텐츠가 선택된 적 있는지 추적 (재선택 시 back API 호출 필요)
  const [hasSelectedContent, setHasSelectedContent] = useState(false);

  // 날짜 선택 관련 상태
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const setDefaultOverlayText = useCallback(() => {
    setOverlayTitle("처리 중...");
    setOverlaySubtitle("잠시만 기다려주세요");
  }, []);

  // 사용자 정보 및 저장된 채팅 로드
  useEffect(() => {
    const name = getUserName();
    setUserName(name);

    // URL에 reset 파라미터가 있으면 초기화 (다른 페이지에서 진입 시)
    const shouldReset = searchParams?.get("reset") === "1";

    if (shouldReset) {
      // 채팅 초기화
      clearChatMessages();
      clearHasSelectedContent(); // sessionStorage 초기화
      setMessages([
        {
          id: 1,
          type: "ai",
          content:
            "장소 추천을 받으시거나, 여행을 계획하고 싶으시다면 편하게 말씀해주세요!",
        },
      ]);
      setCurrentTripId(null);
      setExpandedThemes(new Set());
      setHasSelectedContent(false); // state 초기화
      // reset 파라미터 제거 (URL 정리)
      router.replace("/chat");
    } else {
      // 저장된 채팅 메시지 복원
      const savedMessages = loadChatMessages();
      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages);
      }

      // 저장된 Trip ID 복원
      const savedTripId = loadTripId();
      if (savedTripId) {
        setCurrentTripId(savedTripId);
      }

      // 저장된 콘텐츠 선택 상태 복원
      const savedHasSelectedContent = loadHasSelectedContent();
      setHasSelectedContent(savedHasSelectedContent);
    }

    setIsInitialized(true);
  }, [searchParams, router]);

  // 메시지 변경 시 저장 (초기화 완료 후에만)
  useEffect(() => {
    if (isInitialized) {
      saveChatMessages(messages);
    }
  }, [messages, isInitialized]);

  // Trip ID 변경 시 저장
  useEffect(() => {
    if (isInitialized && currentTripId) {
      saveTripId(currentTripId);
    }
  }, [currentTripId, isInitialized]);

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
      const hasLoading = prev.some((m) => m.id === LOADING_MESSAGE_ID);
      if (hasLoading) {
        return prev.map((m) =>
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
          },
        ];
      }
    });
  }, []);

  // 로딩 메시지 제거 헬퍼
  const removeLoadingMessage = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.id !== LOADING_MESSAGE_ID));
  }, []);

  const startClarifierFlow = useCallback(
    async (tripId: string) => {
      setOverlayTitle("콘텐츠 생성중...");
      setOverlaySubtitle("맞춤 질문을 준비하고 있어요");
      setIsSelectingTheme(true);
      setIsProcessing(true);
      setSelectedContent(null);
      setShowClarifier(false);
      setClarifierData(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
      updateLoadingMessage("콘텐츠를 생성하는 중입니다...");

      try {
        const clarifierPayload = await requestContentAction(tripId);
        removeLoadingMessage();

        if (clarifierPayload?.clarifier?.questions?.length) {
          const initialAnswers: Record<string, string> = {};
          clarifierPayload.clarifier.questions.forEach(
            (q: ClarifierQuestionItem) => {
              initialAnswers[q.field_name] = "";
            }
          );
          setClarifierData(clarifierPayload.clarifier);
          setAnswers(initialAnswers);
          setCurrentQuestionIndex(0);
          setShowClarifier(true);
          return;
        }

        router.push(`/travel/${tripId}`);
      } catch (clarifierError) {
        console.warn(
          "Clarifier 요청 실패, 상세 페이지로 이동합니다.",
          clarifierError
        );
        removeLoadingMessage();
        router.push(`/travel/${tripId}`);
      } finally {
        setIsSelectingTheme(false);
        setIsProcessing(false);
        setDefaultOverlayText();
      }
    },
    [removeLoadingMessage, router, setDefaultOverlayText, updateLoadingMessage]
  );

  const startThemeStream = useCallback(
    (query: string) => {
      // 상태 초기화
      streamStateRef.current = {
        assistantMessageCount: 0,
        themesDisplayed: false,
      };
      hasAddedToHistoryRef.current = false;

      // 새로운 trip_id 생성
      const tripId = crypto.randomUUID();
      setCurrentTripId(tripId);

      // 로컬 스토리지에 저장
      localStorage.setItem("currentTripId", tripId);

      const userId = getUserId();

      // URL 구성
      const params = new URLSearchParams({
        trip_id: tripId,
        user_query: query,
      });

      if (userId) {
        params.append("user_id", userId);
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
        if (event.data === "[DONE]") {
          eventSource.close();
          removeLoadingMessage();
          setIsProcessing(false);
          return;
        }

        try {
          const data: SSEEvent = JSON.parse(event.data);

          switch (data.type) {
            case "assistant_message":
              // assistant_message 카운트 증가
              streamStateRef.current.assistantMessageCount += 1;

              // 로딩 제거하고 AI 메시지 추가 (모든 assistant_message를 채팅 버블로 표시)
              setMessages((prev) => {
                const filtered = prev.filter(
                  (m) => m.id !== LOADING_MESSAGE_ID
                );
                return [
                  ...filtered,
                  {
                    id: Date.now(),
                    type: "ai",
                    content: data.content || "",
                  },
                ];
              });

              // is_searching에 따라 로딩 UI 표시
              setTimeout(() => {
                if (data.is_searching) {
                  // 웹 검색 중일 때
                  if (data.search_query) {
                    updateLoadingMessage(
                      `"${data.search_query}"를 검색하는 중...`
                    );
                  } else {
                    updateLoadingMessage("검색 결과를 분석하는 중...");
                  }
                } else {
                  // 웹 검색 없는 일반 여행 - 테마 생성 로딩
                  updateLoadingMessage(
                    "여행지를 바탕으로 테마를 생성하는 중입니다..."
                  );
                }
              }, 100);
              break;

            case "search_status":
              // 검색 상태 업데이트 (로딩 텍스트만 변경)
              updateLoadingMessage(`${data.count}개 장소를 찾았어요...`);
              break;

            case "themes_ready":
              // themes_ready는 2회 발생: 클러스터링(theme_phrase: null) + 라벨링(최종)
              // theme_phrase가 있는 테마만 필터링하여 마지막 것만 사용 (덮어쓰기)
              const validThemes =
                data.themes?.filter((t) => t.theme_phrase) || [];

              // 유효한 테마가 있을 때만 표시 (라벨링 완료된 최종 데이터)
              if (validThemes.length > 0) {
                streamStateRef.current.themesDisplayed = true;

                // ⭐ 대화 기록에 trip_id 추가 (한 번만)
                const userId = getUserId();
                if (!hasAddedToHistoryRef.current && userId && currentTripId) {
                  hasAddedToHistoryRef.current = true;
                  addToConversationHistory(userId, currentTripId);
                }

                setMessages((prev) => {
                  // 기존 테마 메시지와 로딩 메시지 모두 제거 (덮어쓰기)
                  const filtered = prev.filter(
                    (m) => m.id !== LOADING_MESSAGE_ID && !m.themes
                  );
                  return [
                    ...filtered,
                    {
                      id: Date.now(),
                      type: "ai",
                      content: userName
                        ? `${userName} 님의 요청에 맞춰서 여행 테마를 만들어봤어요.\n원하시는 테마를 고르시거나, 변경하고 싶다면 말씀해주세요.`
                        : "요청에 맞춰서 여행 테마를 만들어봤어요.\n원하시는 테마를 고르시거나, 변경하고 싶다면 말씀해주세요.",
                      themes: validThemes,
                    },
                  ];
                });
              }
              break;

            case "result":
              // result는 최종 확인용 - themes_ready에서 이미 처리했으므로 무시
              if (data.status === "waiting_for_selection") {
                // 테마 선택 대기 상태 확인
                removeLoadingMessage();
              }
              break;

            case "complete":
              // 스트림 종료 - EventSource 닫기
              eventSource.close();
              removeLoadingMessage();
              setIsProcessing(false);
              break;

            case "error":
              setMessages((prev) => {
                const filtered = prev.filter(
                  (m) => m.id !== LOADING_MESSAGE_ID
                );
                return [
                  ...filtered,
                  {
                    id: Date.now(),
                    type: "ai",
                    content: `❌ ${
                      data.message ||
                      "알 수 없는 에러가 발생했어요. 다시 시도해주세요."
                    }`,
                  },
                ];
              });
              setIsProcessing(false);
              break;
          }
        } catch (e) {
          console.error("SSE 파싱 에러:", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE 연결 에러:", err);
        eventSource.close();
        removeLoadingMessage();
        setIsProcessing(false);

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== LOADING_MESSAGE_ID);
          return [
            ...filtered,
            {
              id: Date.now(),
              type: "ai",
              content: "❌ 연결이 끊어졌습니다. 다시 시도해주세요.",
            },
          ];
        });
      };
    },
    [userName, updateLoadingMessage, removeLoadingMessage]
  );

  // 상세 페이지에서 돌아온 경우 Clarifier 흐름 재개
  useEffect(() => {
    if (!searchParams || hasHandledReturnRef.current) return;

    const tripIdFromQuery = searchParams.get("trip_id");
    const shouldConfirm = searchParams.get("confirm") === "1";

    if (tripIdFromQuery) {
      setCurrentTripId(tripIdFromQuery);
      saveTripId(tripIdFromQuery);
    }

    if (tripIdFromQuery && shouldConfirm) {
      hasHandledReturnRef.current = true;
      startClarifierFlow(tripIdFromQuery);
      // 한 번 처리 후 쿼리 제거하여 반복 이동 방지
      router.replace("/chat");
    }
  }, [router, searchParams, startClarifierFlow]);

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

  // 생성 중지 핸들러
  const handleStopGeneration = useCallback(() => {
    // SSE 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 로딩 메시지 제거
    removeLoadingMessage();

    // 처리 상태 초기화
    setIsProcessing(false);

    // 중지 알림 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "ai",
        content: "⏹ 생성이 중지되었어요. 다시 요청해주세요!",
      },
    ]);
  }, [removeLoadingMessage]);

  // 테마 목록 확장/축소 토글
  const toggleThemeExpand = useCallback((messageId: number) => {
    setExpandedThemes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 대화 초기화 핸들러
  const handleReset = () => {
    if (confirm("대화를 초기화하시겠습니까?\n모든 대화 내용이 삭제됩니다.")) {
      // 스트리밍 연결 종료
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // 상태 초기화
      clearChatMessages();
      clearHasSelectedContent(); // sessionStorage 초기화
      setMessages([
        {
          id: 1,
          type: "ai",
          content:
            "장소 추천을 받으시거나, 여행을 계획하고 싶으시다면 편하게 말씀해주세요!",
        },
      ]);
      setCurrentTripId(null);
      setExpandedThemes(new Set());
      setInputValue("");
      setHasSelectedContent(false); // state 초기화
    }
  };

  const handleThemeSelect = async (theme: ThemePreview) => {
    // 중복 요청 방지
    if (!currentTripId || isSelectingTheme) return;

    setOverlayTitle("테마 생성중...");
    setOverlaySubtitle("맞춤 여행 테마를 불러오는 중이에요");
    setIsSelectingTheme(true);
    setIsProcessing(true);
    setSelectedContent(null);
    setShowClarifier(false);
    setClarifierData(null);
    setAnswers({});
    setCurrentQuestionIndex(0);

    try {
      // ⭐ 이전에 콘텐츠가 선택된 적 있으면 먼저 back API 호출 (LangGraph 상태 복원)
      if (hasSelectedContent) {
        console.log("🔙 이전 선택 상태 해제 - back API 호출");
        try {
          await requestContentActionBack(currentTripId);
          console.log("✅ Back action 완료");
        } catch (backError) {
          console.warn("⚠️ Back API 에러 (무시하고 계속):", backError);
        }
      }

      // 테마 선택 API 호출
      const response = await fetch(
        `${API_BASE_URL}/api/agents/home/themes/select`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trip_id: currentTripId,
            theme_index: theme.index,
          }),
        }
      );

      if (response.ok) {
        const data: ThemeSelectResponse = await response.json();

        // ⭐ 콘텐츠 선택됨 상태로 업데이트 (state + sessionStorage)
        setHasSelectedContent(true);
        saveHasSelectedContent(true);

        // 콘텐츠 뷰 표시 (sessionStorage 대신 API로 조회하므로 저장 불필요)
        setSelectedContent(data.content);
        // content_id로 상세 페이지 이동 (trip_id도 함께 전달)
        router.push(
          `/travel/${data.content.content_id}?trip_id=${currentTripId}`
        );
        return;
      } else {
        throw new Error("API 요청 실패");
      }
    } catch (error) {
      console.error("테마 선택 에러:", error);

      // 네트워크 에러인지 확인
      const isNetworkError =
        error instanceof TypeError &&
        (error as Error).message === "Failed to fetch";
      const errorMessage = isNetworkError
        ? "❌ 서버에 연결할 수 없어요. 인터넷 연결을 확인해주세요."
        : "❌ 테마 선택 중 에러가 발생했어요. 다시 시도해주세요.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "ai",
          content: errorMessage,
        },
      ]);
      // 에러 시에만 다시 선택 가능하도록
      setIsSelectingTheme(false);
      setIsProcessing(false);
      setDefaultOverlayText();
      return;
    }

    setIsSelectingTheme(false);
    setIsProcessing(false);
    setDefaultOverlayText();
  };

  // 콘텐츠 확정 후 Clarifier 요청
  const handleConfirmContent = async () => {
    if (!currentTripId) return;
    await startClarifierFlow(currentTripId);
  };

  const handleCancelContent = async () => {
    if (!currentTripId) {
      // trip_id가 없으면 상태만 초기화
      setSelectedContent(null);
      return;
    }

    try {
      // LangGraph 인터럽트 상태 복원 - back 액션 호출
      const response = await requestContentActionBack(currentTripId);

      // 콘텐츠 뷰 닫기
      setSelectedContent(null);
      setShowClarifier(false);
      setClarifierData(null);
      setAnswers({});
      setCurrentQuestionIndex(0);

      console.log("✅ Back action 완료:", response);
    } catch (error) {
      console.error("뒤로가기 API 에러:", error);
      // 에러 시에도 UI는 닫기
      setSelectedContent(null);
      setShowClarifier(false);
      setClarifierData(null);
      setAnswers({});
      setCurrentQuestionIndex(0);
    }
  };

  // Clarifier 제출/건너뛰기 처리
  const handleClarifierSubmit = async (skip = false) => {
    if (!currentTripId) {
      // trip_id가 없으면 이동만 시도
      router.push(`/travel/`);
      return;
    }

    // Clarifier 데이터가 없으면 이동만 (API 호출 불가)
    if (!clarifierData) {
      router.push(`/notes/${currentTripId}`);
      return;
    }

    // 로딩 오버레이 표시
    setOverlayTitle("여행 준비중...");
    setOverlaySubtitle(
      skip ? "질문을 건너뛰고 있어요" : "답변을 저장하고 있어요"
    );
    setIsSelectingTheme(true);
    setIsSubmittingClarifier(true);

    try {
      // 스킵이든 완료든 항상 API 호출 (fire and forget 금지)
      // 스킵해도 입력한 답변은 함께 전송 (high priority 답변 등)
      await submitClarifierAnswer(currentTripId, answers, skip);

      // Plan API 호출이 필요함을 표시 (notes 페이지에서 호출됨)
      sessionStorage.setItem(`planNeeded_${currentTripId}`, "true");

      router.push(`/notes/${currentTripId}`);
    } catch (e) {
      console.error("Clarifier 제출 에러:", e);
      // 에러 시에도 이동 (폴백) - planNeeded 플래그 설정
      sessionStorage.setItem(`planNeeded_${currentTripId}`, "true");
      router.push(`/notes/${currentTripId}`);
    } finally {
      setIsSubmittingClarifier(false);
      setIsSelectingTheme(false);
      setDefaultOverlayText();
    }
  };

  const handleClarifierAnswerChange = (fieldName: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldName]: value }));
  };

  // 날짜 선택 관련 함수들
  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // 첫 번째 날짜 선택 또는 리셋
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      // 두 번째 날짜 선택
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // 캘린더 데이터 생성
  const getCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // 이전 달 날짜
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달 날짜 (6주 채우기)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  const isDateSelected = (date: Date) => {
    if (
      selectedStartDate &&
      date.toDateString() === selectedStartDate.toDateString()
    )
      return true;
    if (
      selectedEndDate &&
      date.toDateString() === selectedEndDate.toDateString()
    )
      return true;
    return false;
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDayOfWeek = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[date.getDay()];
  };

  const formatDateForAnswer = (startDate: Date, endDate: Date) => {
    const format = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    return `${format(startDate)} ~ ${format(endDate)}`;
  };

  // 날짜 선택 시 answers에 자동 반영
  useEffect(() => {
    if (selectedStartDate && selectedEndDate && clarifierData) {
      const currentQuestion = clarifierData.questions[currentQuestionIndex];
      if (currentQuestion?.input_type === "date_range") {
        const dateValue = formatDateForAnswer(
          selectedStartDate,
          selectedEndDate
        );
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.field_name]: dateValue,
        }));
      }
    }
  }, [selectedStartDate, selectedEndDate, clarifierData, currentQuestionIndex]);

  // 질문 변경 시 날짜 상태 초기화 또는 복원
  useEffect(() => {
    if (!clarifierData) return;
    const currentQuestion = clarifierData.questions[currentQuestionIndex];
    if (currentQuestion?.input_type === "date_range") {
      const existingAnswer = answers[currentQuestion.field_name];
      if (existingAnswer) {
        // 기존 답변이 있으면 파싱해서 복원
        const match = existingAnswer.match(
          /(\d{4})-(\d{2})-(\d{2}) ~ (\d{4})-(\d{2})-(\d{2})/
        );
        if (match) {
          setSelectedStartDate(
            new Date(
              parseInt(match[1]),
              parseInt(match[2]) - 1,
              parseInt(match[3])
            )
          );
          setSelectedEndDate(
            new Date(
              parseInt(match[4]),
              parseInt(match[5]) - 1,
              parseInt(match[6])
            )
          );
        }
      } else {
        // 없으면 초기화
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setCurrentMonth(new Date());
      }
    }
  }, [currentQuestionIndex, clarifierData]);

  const handleClarifierNext = () => {
    if (!clarifierData) return;
    const isLast = currentQuestionIndex === clarifierData.questions.length - 1;
    if (isLast) {
      handleClarifierSubmit(false);
    } else {
      setCurrentQuestionIndex((idx) => idx + 1);
    }
  };

  const handleClarifierPrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((idx) => Math.max(0, idx - 1));
  };

  // high priority 질문들이 모두 답변되었는지 확인
  const areHighPriorityQuestionsAnswered = useCallback(() => {
    if (!clarifierData) return true;

    const highPriorityQuestions = clarifierData.questions.filter(
      (q) => q.priority === "high"
    );

    // high priority 질문이 없으면 스킵 가능
    if (highPriorityQuestions.length === 0) return true;

    // 모든 high priority 질문에 대해 답변이 있는지 확인
    return highPriorityQuestions.every(
      (q) => answers[q.field_name] && answers[q.field_name].trim() !== ""
    );
  }, [clarifierData, answers]);

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(today.getDate()).padStart(2, "0")}`;
  };

  // 콘텐츠 뷰 렌더링
  const renderContentView = (contentView: ThemeContent) => {
    const { intro, places } = parseContentText(contentView.content_text);
    const uniqueImages = contentView.carousel_images
      .filter(
        (img, index, self) =>
          index === self.findIndex((i) => i.place_name === img.place_name)
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
              <PlaceTitle>
                {place.number}. {place.name}
              </PlaceTitle>
              {place.content && (
                <PlaceInfo>
                  {place.content
                    .split("\n")
                    .filter((line) => line.trim())
                    .slice(0, 3)
                    .map((line, lineIdx) => (
                      <PlaceInfoItem key={lineIdx}>
                        {line.replace(/^>\s*/, "").replace(/📌.*/, "").trim()}
                      </PlaceInfoItem>
                    ))}
                </PlaceInfo>
              )}
            </PlaceCard>
          ))}
        </ContentBody>

        <ContentActions>
          <ActionButton onClick={handleCancelContent}>뒤로가기</ActionButton>
          <ActionButton $primary onClick={handleConfirmContent}>
            여기로 결정하기
          </ActionButton>
        </ContentActions>
      </ContentViewWrapper>
    );
  };

  return (
    <ChatContainer>
      {/* 테마 선택 시 전체 화면 로딩 오버레이 */}
      {isSelectingTheme && (
        <FullScreenLoading>
          <LoadingSpinner />
          <LoadingOverlayText>{overlayTitle}</LoadingOverlayText>
          <LoadingSubText>{overlaySubtitle}</LoadingSubText>
        </FullScreenLoading>
      )}

      <ChatHeader>
        <BackButton onClick={() => router.back()}>
          <BackIcon />
        </BackButton>
        <HeaderLogo src="/assets/icons/icon.svg" alt="MoodTrip" />
        <ResetButton onClick={handleReset} title="대화 초기화">
          <ResetIcon />
        </ResetButton>
      </ChatHeader>

      <ChatContent ref={chatContentRef}>
        <DateBadge>{getTodayDate()}</DateBadge>

        {messages.map((message) => (
          <MessageWrapper key={message.id} $isUser={message.type === "user"}>
            {message.isLoading ? (
              <LoadingMessage>
                <LoadingIcon />
                <AnimatedText>
                  {message.loadingText || message.content}
                </AnimatedText>
              </LoadingMessage>
            ) : message.isCompleted ? (
              <CompletedMessage>
                <CheckIcon />
                {message.content}
              </CompletedMessage>
            ) : message.themes && message.themes.length > 0 ? (
              <>
                <MessageBubble $isUser={false}>{message.content}</MessageBubble>
                <ThemeCardWrapper style={{ marginTop: "12px" }}>
                  <ThemeList>
                    {(expandedThemes.has(message.id)
                      ? message.themes
                      : message.themes.slice(0, 3)
                    ).map((theme) => (
                      <ThemeItem
                        key={theme.index}
                        $disabled={isSelectingTheme}
                        onClick={() => handleThemeSelect(theme)}
                      >
                        <ThemeImage
                          src={getThemeImage(theme)}
                          alt={theme.city_name}
                        />
                        <ThemeInfo>
                          <ThemeCityName>{theme.theme_phrase}</ThemeCityName>
                          <ThemeDescription>{theme.city_name}</ThemeDescription>
                        </ThemeInfo>
                      </ThemeItem>
                    ))}
                  </ThemeList>
                  {message.themes.length > 3 && (
                    <MoreButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleThemeExpand(message.id);
                      }}
                      style={{
                        transform: expandedThemes.has(message.id)
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
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

      {/* 선택된 콘텐츠 뷰 */}
      {selectedContent && renderContentView(selectedContent)}

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
          {isProcessing ? (
            <StopButton onClick={handleStopGeneration} title="생성 중지">
              <StopIcon />
            </StopButton>
          ) : (
            <SendButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <SendIcon />
            </SendButton>
          )}
        </InputWrapper>
      </InputContainer>

      {/* Clarifier 오버레이 */}
      {showClarifier && clarifierData && clarifierData.questions.length > 0 && (
        <ClarifierOverlay>
          <ClarifierContainer>
            <ClarifierTopBar>
              <ClarifierSpacer />
              <ClarifierSpacer />
            </ClarifierTopBar>

            <ClarifierContentWrapper>
              <ClarifierQuestionNumber>
                질문 {currentQuestionIndex + 1}/{clarifierData.questions.length}
              </ClarifierQuestionNumber>
              <ClarifierTitle>
                {clarifierData.questions[currentQuestionIndex].question}
              </ClarifierTitle>

              {clarifierData.questions[currentQuestionIndex].input_type ===
              "date_range" ? (
                <DatePickerWrapper>
                  <MonthHeader>
                    <MonthTitle>
                      {currentMonth.getFullYear()}년{" "}
                      {currentMonth.getMonth() + 1}월
                    </MonthTitle>
                    <MonthNavigation>
                      <MonthNavButton onClick={handlePrevMonth}>
                        <ChevronLeftIcon />
                      </MonthNavButton>
                      <MonthNavButton onClick={handleNextMonth}>
                        <ChevronRightIcon />
                      </MonthNavButton>
                    </MonthNavigation>
                  </MonthHeader>

                  <CalendarGrid>
                    <DayLabelRow>
                      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                        <DayLabel key={day}>{day}</DayLabel>
                      ))}
                    </DayLabelRow>
                    {Array.from({ length: 6 }).map((_, weekIndex) => (
                      <WeekRow key={weekIndex}>
                        {getCalendarDays()
                          .slice(weekIndex * 7, (weekIndex + 1) * 7)
                          .map((dayData, dayIndex) => {
                            const isSelected = isDateSelected(dayData.date);
                            const inRange = isDateInRange(dayData.date);
                            const isStart =
                              selectedStartDate?.toDateString() ===
                              dayData.date.toDateString();
                            const isEnd =
                              selectedEndDate?.toDateString() ===
                              dayData.date.toDateString();
                            const isStartAndEnd = isStart && isEnd;
                            const isPast = isDatePast(dayData.date);

                            return (
                              <DayCellWrapper
                                key={dayIndex}
                                $inRange={inRange}
                                $isStart={isStart}
                                $isEnd={isEnd}
                                $isStartAndEnd={isStartAndEnd}
                              >
                                <DayCell
                                  $selected={isSelected}
                                  $disabled={!dayData.isCurrentMonth}
                                  $isPast={isPast && dayData.isCurrentMonth}
                                  onClick={() =>
                                    dayData.isCurrentMonth &&
                                    !isPast &&
                                    handleDateSelect(dayData.date)
                                  }
                                >
                                  {dayData.date.getDate()}
                                </DayCell>
                              </DayCellWrapper>
                            );
                          })}
                      </WeekRow>
                    ))}
                  </CalendarGrid>

                  <DateSummary>
                    <DateSummaryItem>
                      <DateSummaryLabel>가는 날</DateSummaryLabel>
                      <DateSummaryValue>
                        {selectedStartDate
                          ? `${
                              selectedStartDate.getMonth() + 1
                            }.${selectedStartDate.getDate()} (${getDayOfWeek(
                              selectedStartDate
                            )})`
                          : "선택해주세요"}
                      </DateSummaryValue>
                    </DateSummaryItem>
                    <DateSummaryItem>
                      <DateSummaryLabel>오는 날</DateSummaryLabel>
                      <DateSummaryValue>
                        {selectedEndDate
                          ? `${
                              selectedEndDate.getMonth() + 1
                            }.${selectedEndDate.getDate()} (${getDayOfWeek(
                              selectedEndDate
                            )})`
                          : "선택해주세요"}
                      </DateSummaryValue>
                    </DateSummaryItem>
                  </DateSummary>
                </DatePickerWrapper>
              ) : (
                <>
                  <ClarifierTextArea
                    placeholder="답변을 입력해주세요 (선택사항)"
                    value={
                      answers[
                        clarifierData.questions[currentQuestionIndex].field_name
                      ] || ""
                    }
                    onChange={(e) =>
                      handleClarifierAnswerChange(
                        clarifierData.questions[currentQuestionIndex]
                          .field_name,
                        e.target.value
                      )
                    }
                  />

                  <ClarifierPageIndicator>
                    {currentQuestionIndex + 1}/{clarifierData.questions.length}
                  </ClarifierPageIndicator>
                </>
              )}
            </ClarifierContentWrapper>

            <ClarifierBottomBar>
              <ClarifierButtonRow>
                <ClarifierNextButton
                  $isActive={!isSubmittingClarifier}
                  onClick={handleClarifierNext}
                  disabled={isSubmittingClarifier}
                >
                  {currentQuestionIndex === clarifierData.questions.length - 1
                    ? "완료"
                    : "다음"}
                </ClarifierNextButton>
              </ClarifierButtonRow>
              <ClarifierSkipAllButton
                $isActive={
                  areHighPriorityQuestionsAnswered() && !isSubmittingClarifier
                }
                onClick={() =>
                  areHighPriorityQuestionsAnswered() &&
                  handleClarifierSubmit(true)
                }
                disabled={
                  isSubmittingClarifier || !areHighPriorityQuestionsAnswered()
                }
              >
                {areHighPriorityQuestionsAnswered()
                  ? clarifierData.skip_button?.label || "질문 건너뛰기"
                  : "필수 질문에 답변해주세요"}
              </ClarifierSkipAllButton>
            </ClarifierBottomBar>
          </ClarifierContainer>
        </ClarifierOverlay>
      )}
    </ChatContainer>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}
