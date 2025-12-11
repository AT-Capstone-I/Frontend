"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled, { keyframes } from "styled-components";
import {
  getTravelNotes,
  getActivePlan,
  getUserId,
  TravelNote,
  ActivePlanResponse,
  ActivePlanDay,
  ActivePlanItem,
} from "@/app/lib/api";
import {
  calculateRoute,
  formatDistance,
  formatDuration,
  RouteData,
} from "@/app/lib/routes";
import { PlaceLocation } from "@/app/components/map/GoogleMapView";

// Google Forms 설문 링크
const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhvVMPwQN1QBTLc5g2TBaYnzjhQl0TufxPi9ObDvqEZAUWUg/viewform?usp=publish-editor";

// ============ Animations ============
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ============ Styled Components - Figma 디자인 기반 ============
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #ffffff);
  padding-bottom: 80px;
`;

// 상단 탭 네비게이션
const TabNavigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--greyscale-300, #e1e1e4);
  background-color: var(--greyscale-000, #ffffff);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ $active }) => ($active ? "var(--greyscale-1200, #111111)" : "var(--greyscale-600, #918e94)")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--primary-500, #4f9de8);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: var(--greyscale-1200, #111111);
  }
`;

const Content = styled.div`
  padding: 20px;
`;

// 여행 정보 헤더
const TripHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const TripSubtitle = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-600, #918e94);
`;

// 여행 선택 토글 영역
const TripTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const TripToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--greyscale-700, #77747b);
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: var(--greyscale-900, #444246);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TripTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.12px;
  color: var(--greyscale-1200, #111111);
`;

// 여행 선택 드롭다운
const TripDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  max-width: 280px;
  z-index: 100;
  overflow: hidden;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  animation: ${fadeIn} 0.2s ease;
`;

const TripDropdownItem = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 14px 16px;
  background-color: ${({ $active }) => ($active ? "var(--primary-050, #f2f8ff)" : "transparent")};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "var(--primary-050, #f2f8ff)" : "var(--greyscale-100, #f5f5f5)")};
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--greyscale-200, #f2f1f2);
  }
`;

const TripDropdownName = styled.span<{ $active?: boolean }>`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  color: ${({ $active }) => ($active ? "var(--primary-500, #4f9de8)" : "var(--greyscale-1000, #2b2a2c)")};
`;

const TripDropdownDate = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-600, #918e94);
`;

// 날짜 선택 버튼
const DateSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DateButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  border: 1px solid ${({ $active }) => ($active ? "transparent" : "var(--greyscale-300, #e1e1e4)")};
  background-color: ${({ $active }) => ($active ? "var(--greyscale-900, #444246)" : "var(--greyscale-000, #ffffff)")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--greyscale-900, #444246)")};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ $active }) => ($active ? "var(--greyscale-900, #444246)" : "var(--greyscale-100, #f5f5f5)")};
  }
`;

// 일차 헤더
const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DayLabel = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1200, #111111);
`;

const EditButton = styled.button`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-800, #5e5b61);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-500, #4f9de8);
  }
`;

// 타임라인 - 연속 세로선 포함
const Timeline = styled.div`
  position: relative;
  padding-left: 31px;

  /* 연속적인 세로 연결선 */
  &::before {
    content: '';
    position: absolute;
    left: 7.5px; /* 마커 중심 위치 (31px - 23.5px = 7.5px) */
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: var(--greyscale-300, #e1e1e4);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

// 카드와 마커를 함께 감싸는 wrapper
const CardWrapper = styled.div`
  position: relative;
`;

// 체크 아이콘 (마커) - 카드 중앙에 위치
const CheckIcon = styled.div<{ $completed: boolean }>`
  position: absolute;
  left: -31px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ $completed }) => ($completed ? "var(--greyscale-1200, #111111)" : "var(--greyscale-000, #ffffff)")};
  border: 1px solid ${({ $completed }) => ($completed ? "var(--greyscale-1200, #111111)" : "var(--greyscale-400, #c4c2c6)")};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  svg {
    width: 9px;
    height: 9px;
    color: #ffffff;
    display: ${({ $completed }) => ($completed ? "block" : "none")};
  }
`;

// 이동 정보 영역
const TransitLine = styled.div`
  position: relative;
`;

// 일정 카드
const ScheduleCard = styled.div`
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
  padding: 14px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlaceName = styled.h4`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2b2a2c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlaceAddress = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-600, #918e94);
`;

const PlaceTime = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: var(--greyscale-500, #aaa8ad);
`;

const ReviewButton = styled.button`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--primary-500, #4f9de8);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-600, #3d8bd6);
  }
`;

// 이동 정보
const TransitInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  margin-left: 14px;
`;

const TransitText = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-700, #77747b);
`;

// 하단 버튼
const AskButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  background-color: var(--greyscale-900, #444246);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-1000, #2b2a2c);
  }
`;

// ============ 로딩/에러 상태 스타일 ============
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "20px"};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--greyscale-900, #444246);
  margin-bottom: 8px;
`;

const EmptyDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  color: var(--greyscale-600, #918e94);
  margin-bottom: 24px;
`;

const EmptyButton = styled.button`
  padding: 14px 32px;
  background: var(--greyscale-900, #444246);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--greyscale-1000, #2b2a2c);
  }
`;

// ============ 실시간 추천 탭 스타일 ============
const AdSliderContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #0c0d16;
  color: #ffffff;
  margin-bottom: 12px;
  box-shadow: 0 8px 18px rgba(10, 12, 26, 0.15);
`;

const AdSliderTrack = styled.div<{ $currentIndex: number }>`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${({ $currentIndex }) => -$currentIndex * 100}%);
`;

const AdSlide = styled.div`
  position: relative;
  min-width: 100%;
  height: 120px;
  background: #11121a;
`;

const AdImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.08);
`;

const AdOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    rgba(5, 6, 11, 0.85) 0%,
    rgba(5, 6, 11, 0.62) 48%,
    rgba(5, 6, 11, 0.08) 100%
  );
`;

const AdContent = styled.div`
  position: relative;
  padding: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 6px;
`;

const AdTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AdBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AdMeta = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
`;

const AdTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.22px;
  color: #ffffff;
  margin: 0;
`;

const AdDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const AdTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const AdTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
`;

const AdCTAWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
`;

const AdCTAButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 11px;
  border: none;
  background: linear-gradient(135deg, #4f9de8, #6cc3ff);
  color: #ffffff;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(79, 157, 232, 0.28);
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(79, 157, 232, 0.36);
  }
`;

const AdSubtext = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
`;

const RecommendSection = styled.section`
  margin-bottom: 32px;
`;

const RecommendTitle = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1000, #2b2a2c);
  margin-bottom: 12px;

  p {
    margin: 0;
  }
`;

const RecommendScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  padding-right: 20px;
  margin-right: -20px;
  -webkit-overflow-scrolling: touch;
`;

const RecommendCard = styled.div`
  flex-shrink: 0;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RecommendImageWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 212px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-300, #b8b8b8);
`;

const RecommendImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeartButton = styled.button<{ $filled?: boolean }>`
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  opacity: ${({ $filled }) => ($filled ? 1 : 0.7)};

  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const RecommendInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 41px;
  justify-content: center;
`;

const RecommendName = styled.h4`
  font-family: 'Pretendard', sans-serif;
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

const RecommendAddress = styled.p`
  font-family: 'Pretendard', sans-serif;
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

// ============ 작성한 리뷰 탭 스타일 ============
const ReviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--greyscale-200, #f2f1f2);
  margin-bottom: 24px;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ReviewTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const ReviewEditButton = styled.button`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-800, #5e5b61);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: var(--primary-500, #4f9de8);
  }
`;

const ReviewImageScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-right: 20px;
  margin-right: -20px;
  -webkit-overflow-scrolling: touch;
`;

const ReviewImageBox = styled.div`
  flex-shrink: 0;
  width: 148px;
  height: 148px;
  background-color: var(--greyscale-200, #f2f1f2);
  border-radius: 12px;
  overflow: hidden;
`;

const ReviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ReviewContent = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2b2a2c);
  margin: 0;
`;

// ============ 아이콘 컴포넌트 ============
const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);


const ChevronDownIcon = ({ $isOpen }: { $isOpen?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transform: $isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// ============ 샘플 데이터 (추천/리뷰 탭용) ============
const adBannerData = [
  {
    id: "yeosu-night",
    badge: "스폰서",
    title: "여수 야경 요트 투어",
    image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&auto=format&fit=crop",
    ctaLabel: "투어 보기",
    ctaLink: "/travel",
    subtext: "여수 전용 프로모션",
  },
  {
    id: "suncheon-garden",
    badge: "AD · 오늘만",
    title: "순천만 국가정원 패스",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop",
    ctaLabel: "패스 받기",
    ctaLink: "/schedule",
    subtext: "순천 제휴 입장권",
  },
  {
    id: "rainy-day",
    badge: "AD · 오늘만",
    title: "비 오는 날 루프탑 디너",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&auto=format&fit=crop",
    ctaLabel: "바로 예약",
    ctaLink: "/schedule",
    subtext: "여수·순천 다이닝",
  },
];

const weatherRecommendData = [
  {
    id: 1,
    name: "순이네밥상",
    address: "전남 여수시 통제영5길 5 1층 순이네밥상",
    image: "https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=300&h=400&fit=crop",
    liked: true,
  },
  {
    id: 2,
    name: "모이핀 스카이점",
    address: "전라남도 여수시 돌산읍 무술목길 59 모이핀 스카이점",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=300&h=400&fit=crop",
    liked: false,
  },
  {
    id: 3,
    name: "여진식당",
    address: "전남 여수시 학동5길 2-2",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=400&fit=crop",
    liked: false,
  },
];

const foodRecommendData = [
  {
    id: 1,
    name: "덕충식당",
    address: "전남 여수시 공화남3길 9",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop",
    liked: true,
  },
  {
    id: 2,
    name: "청정게장촌",
    address: "전남 여수시 봉산남4길 23-32 청정게장촌",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=400&fit=crop",
    liked: false,
  },
  {
    id: 3,
    name: "진남옥",
    address: "전남 여수시 통제영3길 6 1층 진남옥",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=400&fit=crop",
    liked: false,
  },
];

// ============ 유틸리티 함수 ============
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}. ${date.getDate()}`;
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  const startStr = `${start.getMonth() + 1}/${start.getDate()}`;
  if (!endDate) return startStr;
  const end = new Date(endDate);
  const endStr = `${end.getMonth() + 1}/${end.getDate()}`;
  return `${startStr} - ${endStr}`;
};

// ============ 메인 컴포넌트 ============
export default function SchedulePage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<"schedule" | "recommend">("schedule");
  const [adIndex, setAdIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  
  // API 상태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 여행 목록 및 선택된 여행
  const [trips, setTrips] = useState<TravelNote[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TravelNote | null>(null);
  const [planData, setPlanData] = useState<ActivePlanResponse | null>(null);
  
  // 토글 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 경로 계산 상태
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // API에서 여행 목록 로드
  useEffect(() => {
    const fetchTrips = async () => {
      const userId = getUserId();
      if (!userId) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // 사용자의 여행 노트 조회
        const notesData = await getTravelNotes(userId);
        
        // ongoing과 planning 상태의 여행 합치기 (ongoing 우선)
        const availableTrips = [
          ...notesData.ongoing,
          ...notesData.planning,
        ];
        
        if (availableTrips.length === 0) {
          setError("진행 중인 여행이 없습니다.");
          setIsLoading(false);
          return;
        }
        
        setTrips(availableTrips);
        
        // 첫 번째 여행 선택
        const firstTrip = availableTrips[0];
        setSelectedTrip(firstTrip);
        
        // 해당 trip의 활성 일정 조회
        await loadPlanForTrip(firstTrip.trip_id);
        
      } catch (err) {
        console.error("여행 목록 로드 실패:", err);
        setError("여행 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // 특정 여행의 일정 로드
  const loadPlanForTrip = async (tripId: string) => {
    try {
      const plan = await getActivePlan(tripId);
      setPlanData(plan);
      setSelectedDate(0); // 날짜 선택 초기화
      setRouteData(null); // 경로 데이터 초기화
    } catch (err) {
      console.error("일정 로드 실패:", err);
      setPlanData(null);
      setRouteData(null);
    }
  };

  // 여행 선택 변경
  const handleTripSelect = async (trip: TravelNote) => {
    setSelectedTrip(trip);
    setIsDropdownOpen(false);
    setIsLoading(true);
    
    try {
      await loadPlanForTrip(trip.trip_id);
    } finally {
      setIsLoading(false);
    }
  };

  // 여행 이름 생성
  const getTripName = (trip: TravelNote | null) => {
    if (!trip) return "여행";
    return trip.final_city 
      ? `${trip.final_city} 여행` 
      : trip.selected_city 
        ? `${trip.selected_city} 여행`
        : "여행";
  };

  // 여행 테마/서브타이틀
  const getTripSubtitle = (trip: TravelNote | null) => {
    if (!trip) return "";
    return trip.selected_theme || formatDateRange(trip.start_date, trip.end_date) || "";
  };

  // 현재 선택된 날짜의 일정
  const currentDaySchedule: ActivePlanDay | null = planData?.days?.[selectedDate] || null;

  // 지도에 표시할 장소 데이터 변환 (경로 계산용)
  const mapPlaces: PlaceLocation[] = useMemo(() => {
    if (!currentDaySchedule) return [];

    return currentDaySchedule.items
      .filter((item) => item.latitude && item.longitude) // 위치 정보가 있는 장소만
      .map((item) => ({
        id: item.place_id,
        name: item.name,
        location: {
          lat: item.latitude!,
          lng: item.longitude!,
        },
      }));
  }, [currentDaySchedule]);

  // 경로 계산 (장소가 변경될 때마다)
  // Google Maps API가 로드된 경우에만 실행
  useEffect(() => {
    const fetchRoute = async () => {
      // Google Maps가 로드되지 않았으면 스킵 (지도 없는 페이지에서는 정상)
      if (typeof google === "undefined" || !google.maps) {
        setRouteData(null);
        return;
      }

      if (mapPlaces.length > 1) {
        setIsCalculatingRoute(true);
        try {
          const route = await calculateRoute(mapPlaces);
          if (route) {
            setRouteData(route);
          } else {
            setRouteData(null);
          }
        } catch (error) {
          console.error("Route calculation failed:", error);
          setRouteData(null);
        } finally {
          setIsCalculatingRoute(false);
        }
      } else {
        setRouteData(null);
      }
    };

    fetchRoute();
  }, [mapPlaces]);

  // 특정 인덱스의 이동 정보 가져오기
  const getTransitInfo = useCallback((index: number) => {
    if (!routeData || !routeData.segments[index]) {
      return null;
    }
    const segment = routeData.segments[index];
    return {
      distance: formatDistance(segment.distanceMeters),
      duration: formatDuration(segment.travelDurationSeconds || segment.durationSeconds),
    };
  }, [routeData]);

  // 스토리 페이지로 이동
  const handleTripEndClick = () => {
    if (!selectedTrip?.trip_id) return;
    // 새 탭으로 설문 링크 열기
    window.open(SURVEY_URL, "_blank");
    // 스토리 페이지로 이동 (tripId 기반)
    router.push(`/schedule/story/${selectedTrip.trip_id}`);
  };

  // 광고 배너 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % adBannerData.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const handleAdCtaClick = (link?: string) => {
    if (!link) {
      router.push("/chat");
      return;
    }
    if (link.startsWith("http")) {
      window.open(link, "_blank");
      return;
    }
    router.push(link);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <PageWrapper>
        <TabNavigation>
          <TabButton $active={true}>내 일정</TabButton>
          <TabButton $active={false}>실시간 추천</TabButton>
        </TabNavigation>
        <LoadingWrapper>
          <SkeletonBox $width="60%" $height="16px" />
          <SkeletonBox $width="40%" $height="28px" />
          <SkeletonBox $width="100%" $height="32px" />
          <SkeletonBox $width="100%" $height="100px" />
          <SkeletonBox $width="100%" $height="100px" />
          <SkeletonBox $width="100%" $height="100px" />
        </LoadingWrapper>
      </PageWrapper>
    );
  }

  // 에러/빈 상태
  if (error || trips.length === 0) {
    return (
      <PageWrapper>
        <TabNavigation>
          <TabButton $active={true}>내 일정</TabButton>
          <TabButton $active={false}>실시간 추천</TabButton>
        </TabNavigation>
        <EmptyState>
          <EmptyIcon>📅</EmptyIcon>
          <EmptyTitle>{error || "진행 중인 여행이 없습니다"}</EmptyTitle>
          <EmptyDescription>
            새로운 여행을 계획하고<br />일정을 확인해보세요!
          </EmptyDescription>
          <EmptyButton onClick={() => router.push("/chat")}>
            여행 계획하기
          </EmptyButton>
        </EmptyState>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TabNavigation>
        <TabButton $active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
          내 일정
        </TabButton>
        <TabButton $active={activeTab === "recommend"} onClick={() => setActiveTab("recommend")}>
          실시간 추천
        </TabButton>
      </TabNavigation>

      <Content>
        {activeTab === "schedule" && (
          <>
            <TripHeader>
              <TripSubtitle>{getTripSubtitle(selectedTrip)}</TripSubtitle>
              <TripTitleRow ref={dropdownRef}>
                <TripToggleButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <ChevronDownIcon $isOpen={isDropdownOpen} />
                </TripToggleButton>
                <TripTitle>{getTripName(selectedTrip)}</TripTitle>
                
                {/* 여행 선택 드롭다운 */}
                <TripDropdown $isOpen={isDropdownOpen}>
                  {trips.map((trip) => (
                    <TripDropdownItem
                      key={trip.trip_id}
                      $active={selectedTrip?.trip_id === trip.trip_id}
                      onClick={() => handleTripSelect(trip)}
                    >
                      <TripDropdownName $active={selectedTrip?.trip_id === trip.trip_id}>
                        {getTripName(trip)}
                      </TripDropdownName>
                      <TripDropdownDate>
                        {formatDateRange(trip.start_date, trip.end_date) || "날짜 미정"}
                      </TripDropdownDate>
                    </TripDropdownItem>
                  ))}
                </TripDropdown>
              </TripTitleRow>
            </TripHeader>

            {/* 일정이 없는 경우 */}
            {!planData || !planData.days || planData.days.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🗓️</EmptyIcon>
                <EmptyTitle>아직 일정이 없습니다</EmptyTitle>
                <EmptyDescription>
                  여행 노트에서 일정을 생성해주세요.
                </EmptyDescription>
                <EmptyButton onClick={() => router.push(`/notes/${selectedTrip?.trip_id}`)}>
                  일정 만들기
                </EmptyButton>
              </EmptyState>
            ) : (
              <>
                <DateSelector>
                  {planData.days.map((day, index) => (
                    <DateButton
                      key={day.date}
                      $active={selectedDate === index}
                      onClick={() => setSelectedDate(index)}
                    >
                      {formatDate(day.date)}
                    </DateButton>
                  ))}
                </DateSelector>

                <DayHeader>
                  <DayLabel>{selectedDate + 1}일차</DayLabel>
                  <EditButton onClick={() => router.push(`/notes/${selectedTrip?.trip_id}`)}>
                    편집
                  </EditButton>
                </DayHeader>

                {currentDaySchedule && currentDaySchedule.items.length > 0 ? (
                  <Timeline>
                    {currentDaySchedule.items.map((item, index) => {
                      const transitInfo = getTransitInfo(index);
                      const isLast = index === currentDaySchedule.items.length - 1;
                      return (
                        <TimelineItem key={`${item.place_id}-${index}`}>
                          <CardWrapper>
                            <CheckIcon $completed={index < 2}>
                              <CheckmarkIcon />
                            </CheckIcon>
                            <ScheduleCard>
                              <CardContent>
                                <PlaceInfo>
                                  <PlaceName>{item.name}</PlaceName>
                                  {item.address && <PlaceAddress>{item.address}</PlaceAddress>}
                                  {item.start && item.end && (
                                    <PlaceTime>{item.start} - {item.end}</PlaceTime>
                                  )}
                                </PlaceInfo>
                                <ReviewButton>리뷰 작성하기</ReviewButton>
                              </CardContent>
                            </ScheduleCard>
                          </CardWrapper>
                          {!isLast && (
                            <TransitLine>
                              <TransitInfo>
                                {isCalculatingRoute ? (
                                  <TransitText>경로 계산 중...</TransitText>
                                ) : transitInfo ? (
                                  <>
                                    <TransitText>{transitInfo.distance}</TransitText>
                                    <TransitText>{transitInfo.duration}</TransitText>
                                  </>
                                ) : item.eta_min ? (
                                  <TransitText>약 {item.eta_min}분</TransitText>
                                ) : null}
                              </TransitInfo>
                            </TransitLine>
                          )}
                        </TimelineItem>
                      );
                    })}
                  </Timeline>
                ) : (
                  <EmptyState>
                    <EmptyIcon>📍</EmptyIcon>
                    <EmptyTitle>이 날의 일정이 없습니다</EmptyTitle>
                    <EmptyDescription>
                      여행 노트에서 일정을 추가해보세요.
                    </EmptyDescription>
                  </EmptyState>
                )}

                <AskButton onClick={handleTripEndClick}>
                  오늘 여행은 어떠셨나요?
                </AskButton>
              </>
            )}
          </>
        )}

        {activeTab === "recommend" && (
          <>
            <TripHeader>
              <TripSubtitle>{getTripSubtitle(selectedTrip)}</TripSubtitle>
              <TripTitle>{getTripName(selectedTrip)}</TripTitle>
            </TripHeader>

            <AdSliderContainer aria-label="스폰서 배너 영역">
              <AdSliderTrack $currentIndex={adIndex}>
                {adBannerData.map((ad) => (
                  <AdSlide key={ad.id}>
                    <AdImage src={ad.image} alt={ad.title} />
                    <AdOverlay />
                    <AdContent>
                      <AdTopRow>
                        <AdBadge>{ad.badge}</AdBadge>
                        <AdMeta>AD · 실시간 업데이트</AdMeta>
                      </AdTopRow>
                      <AdTitle>{ad.title}</AdTitle>
                      <AdCTAWrapper>
                        <AdCTAButton onClick={() => handleAdCtaClick(ad.ctaLink)}>
                          {ad.ctaLabel}
                          <span aria-hidden>→</span>
                        </AdCTAButton>
                        <AdSubtext>{ad.subtext}</AdSubtext>
                      </AdCTAWrapper>
                    </AdContent>
                  </AdSlide>
                ))}
              </AdSliderTrack>
            </AdSliderContainer>

            {/* 날씨 기반 추천 */}
            <RecommendSection>
              <RecommendTitle>
                <p>현재 비가 내리고 있어요.</p>
                <p>비오는 날, 인기 플레이스를 추천해요.</p>
              </RecommendTitle>
              <RecommendScroll>
                {weatherRecommendData.map((item) => (
                  <RecommendCard key={item.id}>
                    <RecommendImageWrapper>
                      <RecommendImage src={item.image} alt={item.name} />
                      <HeartButton $filled={item.liked}>
                        <Image
                          src="/assets/icons/heart.svg"
                          alt="즐겨찾기"
                          width={24}
                          height={24}
                        />
                      </HeartButton>
                    </RecommendImageWrapper>
                    <RecommendInfo>
                      <RecommendName>{item.name}</RecommendName>
                      <RecommendAddress>{item.address}</RecommendAddress>
                    </RecommendInfo>
                  </RecommendCard>
                ))}
              </RecommendScroll>
            </RecommendSection>

            {/* 맛집 추천 */}
            <RecommendSection>
              <RecommendTitle>
                <p>다른 맛집을 찾고 계신가요?</p>
              </RecommendTitle>
              <RecommendScroll>
                {foodRecommendData.map((item) => (
                  <RecommendCard key={item.id}>
                    <RecommendImageWrapper>
                      <RecommendImage src={item.image} alt={item.name} />
                      <HeartButton $filled={item.liked}>
                        <Image
                          src="/assets/icons/heart.svg"
                          alt="즐겨찾기"
                          width={24}
                          height={24}
                        />
                      </HeartButton>
                    </RecommendImageWrapper>
                    <RecommendInfo>
                      <RecommendName>{item.name}</RecommendName>
                      <RecommendAddress>{item.address}</RecommendAddress>
                    </RecommendInfo>
                  </RecommendCard>
                ))}
              </RecommendScroll>
            </RecommendSection>
          </>
        )}
      </Content>
    </PageWrapper>
  );
}
