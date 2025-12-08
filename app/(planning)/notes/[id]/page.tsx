"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { ThemeContent } from "@/app/lib/api";
import GoogleMapView, {
  PlaceLocation,
  RouteSegment,
} from "@/app/components/map/GoogleMapView";
import {
  calculateRoute,
  formatDistance,
  formatDuration,
  RouteData,
} from "@/app/lib/routes";
import { DUMMY_SCHEDULE_DATA } from "@/app/lib/dummyData";

// 여행노트 데이터 타입
interface TravelNoteData {
  tripId: string;
  themeContent: ThemeContent;
  clarifierAnswers: Record<string, string>;
  userProfileSummary: string;
  createdAt: string;
}

// 일정 데이터 타입
interface PlaceData {
  id: string;
  name: string;
  checked: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

interface DayData {
  day: number;
  places: PlaceData[];
}

interface ScheduleData {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  days: DayData[];
}

// Styled Components - Figma Design System 적용
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--greyscale-000, #ffffff);
  position: relative;
  overflow: hidden;
`;

const MapSection = styled.div<{ $bottomOffset: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${({ $bottomOffset }) => $bottomOffset}px;
  background-color: #e8e8e8;
  overflow: hidden;
  transition: bottom 0.15s ease-out;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  padding: 10px;
  background-color: var(--greyscale-000, #ffffff);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    width: 24px;
    height: 24px;
    color: var(--greyscale-900, #444246);
  }
`;

const BottomSheetContainer = styled.div<{ $height: number }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 84px;
  height: ${({ $height }) => $height}%;
  min-height: 180px;
  max-height: calc(100% - 120px);
  display: flex;
  flex-direction: column;
  transition: height 0.15s ease-out;
  z-index: 20;
  pointer-events: auto;
`;

const BottomSheet = styled.div`
  flex: 1;
  background-color: var(--greyscale-000, #ffffff);
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DragHandleArea = styled.div`
  padding: 12px 0;
  cursor: grab;
  touch-action: none;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.div`
  width: 38px;
  height: 4px;
  background-color: #d9d9d9;
  border-radius: 50px;
  margin: 0 auto;
`;

const SheetContent = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
`;

const TabContainer = styled.div`
  margin: 0 20px 24px;
  background-color: var(--greyscale-200, #f2f1f2);
  border-radius: 12px;
  padding: 4px;
  display: flex;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background-color: ${({ $active }) =>
    $active ? "var(--greyscale-000, #FFFFFF)" : "transparent"};
  cursor: pointer;
  transition: background-color 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const TabText = styled.span<{ $active: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ $active }) =>
    $active
      ? "var(--greyscale-1000, #2B2A2C)"
      : "var(--greyscale-800, #5E5B61)"};
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 8px;
`;

const DayTitle = styled.h2`
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.108px;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const DayNavigation = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button<{ $disabled?: boolean }>`
  width: 24px;
  height: 24px;
  background-color: var(--greyscale-100, #f7f7f7);
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $disabled }) =>
      $disabled
        ? "var(--greyscale-500, #AAA8AD)"
        : "var(--greyscale-1200, #111111)"};
  }
`;

const DateInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 14px;
    height: 14px;
    color: var(--greyscale-700, #77747b);
  }
`;

const DateText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747b);
`;

const EditButton = styled.button`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747b);
  background: none;
  border: none;
  cursor: pointer;
`;

const TimelineContainer = styled.div`
  position: relative;
  padding: 0 20px;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 27px;
  top: 0;
  bottom: 20px;
  width: 1px;
  background-color: var(--greyscale-300, #e1e1e4);
`;

const ScheduleItem = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const MarkerContainer = styled.div`
  position: absolute;
  left: 0;
  top: 14px;
  width: 15px;
  height: 15px;
  z-index: 1;
`;

const Marker = styled.div<{ $checked?: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1px solid var(--greyscale-400, #c4c2c6);
  background-color: ${({ $checked }) =>
    $checked
      ? "var(--greyscale-900, #444246)"
      : "var(--greyscale-000, #FFFFFF)"};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 8px;
    height: 8px;
    color: white;
  }
`;

const PlaceCard = styled.div`
  margin-left: 31px;
  padding: 14px;
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
`;

const PlaceName = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2b2a2c);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TravelInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 45px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const TravelInfoText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-700, #77747b);
`;

const BottomBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--greyscale-000, #ffffff);
  padding: 12px 20px;
  border-top: 1px solid var(--greyscale-200, #f2f1f2);
  z-index: 30;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 18px 32px;
  background-color: var(--greyscale-900, #444246);
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-000, #ffffff);
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

// 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: 300px;
  background-color: var(--greyscale-000, #ffffff);
  border-radius: 12px;
  overflow: hidden;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 20px 24px;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.12px;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const ModalDescription = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-800, #5e5b61);
  margin: 0;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  border-top: 1px solid var(--greyscale-300, #e1e1e4);
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: ${({ $primary }) => ($primary ? 600 : 400)};
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: ${({ $primary }) =>
    $primary
      ? "var(--greyscale-1200, #111111)"
      : "var(--greyscale-600, #918E94)"};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-100, #f7f7f7);
  }

  &:first-child {
    border-right: 1px solid var(--greyscale-300, #e1e1e4);
  }
`;

const EmptyFavorites = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--greyscale-600, #918e94);

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
`;

// 날짜 선택 모달 스타일 (Figma 디자인)
const DatePickerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const DatePickerContainer = styled.div`
  flex: 1;
  background-color: var(--greyscale-000, #ffffff);
  display: flex;
  flex-direction: column;
`;

const DatePickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  border-bottom: 1px solid var(--greyscale-200, #f2f1f2);
`;

const DatePickerTitle = styled.h2`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--greyscale-1200, #2e2e2e);
  margin: 0;
`;

const DatePickerDateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  color: var(--greyscale-700, #77747b);
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 20px 16px;
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
  width: 24px;
  height: 24px;
  background-color: var(--greyscale-100, #f7f7f7);
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    color: var(--greyscale-1200, #111111);
  }
`;

const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 0 29px;
`;

const WeekRow = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
`;

const DayLabel = styled.span`
  width: 18px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--greyscale-900, #444246);
  text-align: center;
`;

const DayCell = styled.button<{
  $selected?: boolean;
  $inRange?: boolean;
  $disabled?: boolean;
  $isStart?: boolean;
  $isEnd?: boolean;
}>`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: ${({ $isStart, $isEnd }) =>
    $isStart ? "18px 0 0 18px" : $isEnd ? "0 18px 18px 0" : "0"};
  background-color: ${({ $selected, $inRange }) =>
    $selected ? "#66B2FE" : $inRange ? "#F2F8FF" : "transparent"};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $selected, $disabled }) =>
    $selected ? "white" : $disabled ? "#C4C2C6" : "#111111"};
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${({ $selected, $disabled }) =>
      $disabled ? "transparent" : $selected ? "#66B2FE" : "#F2F8FF"};
  }
`;

const DateSummary = styled.div`
  background-color: var(--greyscale-100, #f1f1f1);
  padding: 12px 20px;
  display: flex;
  justify-content: center;
  gap: 66px;
`;

const DateSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 103px;
`;

const DateSummaryLabel = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  color: var(--greyscale-900, #444246);
`;

const DateSummaryValue = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--greyscale-1000, #2b2a2c);
`;

const DatePickerFooter = styled.div`
  display: flex;
  gap: 11px;
  padding: 12px 20px;
  background-color: var(--greyscale-000, #ffffff);
  box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.06);
`;

const DatePickerButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 18px 32px;
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({ $primary }) =>
    $primary
      ? "var(--greyscale-900, #444246)"
      : "var(--greyscale-200, #f2f1f2)"};
  color: ${({ $primary }) =>
    $primary ? "white" : "var(--greyscale-1000, #2b2a2c)"};
`;

// Figma 디자인: 플로팅 채팅 버튼
const FloatingChatButton = styled.button`
  position: absolute;
  right: 20px;
  bottom: 100px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-400, #66b2fe);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 25;
  box-shadow: 0 4px 12px rgba(102, 178, 254, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 178, 254, 0.5);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 30px;
    height: 30px;
    color: white;
  }
`;

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

// Figma 디자인에 맞춘 아이콘
const PinIcon = ({ active = false }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "#4F9DE8" : "#5E5B61"}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const HeartIcon = ({ active = false }: { active?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={active ? "#FFB800" : "none"}
    stroke={active ? "#FFB800" : "#5E5B61"}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// 채팅 아이콘 (Figma 디자인)
const ChatIcon = () => (
  <svg viewBox="0 0 30 30" fill="currentColor">
    <path d="M6 6h18c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H8l-4 4V8c0-1.1.9-2 2-2z" />
    <path
      d="M10 10h10M10 14h6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// 여행노트 데이터에서 일정 데이터 생성 헬퍼 함수
const generateScheduleFromNote = (noteData: TravelNoteData): ScheduleData => {
  const { themeContent, clarifierAnswers } = noteData;

  // 날짜 정보 추출 (clarifierAnswers에서)
  const startDateAnswer = clarifierAnswers?.start_date || "";
  const today = new Date();
  const startDate =
    startDateAnswer ||
    `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(today.getDate()).padStart(2, "0")}`;

  // place_ids에서 장소 목록 생성
  const placeIds = themeContent?.place_ids || [];
  const carouselImages = themeContent?.carousel_images || [];

  // 장소명 및 위치 매핑 (carousel_images에서 추출)
  const placeDataMap: Record<
    string,
    { name: string; location?: { lat: number; lng: number } }
  > = {};
  carouselImages.forEach((img) => {
    placeDataMap[img.place_id] = {
      name: img.place_name,
      location:
        img.latitude && img.longitude
          ? {
              lat: img.latitude,
              lng: img.longitude,
            }
          : undefined,
    };
  });

  // 하루에 3-4개 장소씩 배분
  const placesPerDay = 4;
  const days: DayData[] = [];

  for (let i = 0; i < placeIds.length; i += placesPerDay) {
    const dayPlaces = placeIds
      .slice(i, i + placesPerDay)
      .map((placeId, idx) => ({
        id: placeId,
        name: placeDataMap[placeId]?.name || `장소 ${i + idx + 1}`,
        checked: false,
        location: placeDataMap[placeId]?.location,
      }));

    if (dayPlaces.length > 0) {
      days.push({
        day: days.length + 1,
        places: dayPlaces,
      });
    }
  }

  // 최소 1일 보장
  if (days.length === 0) {
    days.push({
      day: 1,
      places: [{ id: "1", name: "장소를 추가해주세요", checked: false }],
    });
  }

  return {
    id: noteData.tripId,
    title: themeContent?.city_name || "여행",
    subtitle: themeContent?.theme_phrase || "",
    startDate,
    endDate: "",
    totalDays: days.length,
    days,
  };
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "favorites">(
    "schedule"
  );
  const [currentDay, setCurrentDay] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(50); // 초기 높이 50% (3단계: 25%, 50%, 85%)
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const currentHeightRef = useRef(50); // 현재 높이 추적용
  const isNavigatingRef = useRef(false);

  // 여행노트 데이터 상태
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteData, setNoteData] = useState<TravelNoteData | null>(null);

  // 경로 데이터 상태
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // 날짜 선택 모달 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // sessionStorage에서 여행노트 데이터 로드
  useEffect(() => {
    const tripId = params.id as string;
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    try {
      const storedData = sessionStorage.getItem(`travelNote_${tripId}`);

      // 유효한 JSON 문자열인지 확인
      if (storedData && storedData !== "undefined" && storedData !== "null") {
        const parsedData: TravelNoteData = JSON.parse(storedData);

        // 파싱된 객체가 유효한지 확인
        if (parsedData && typeof parsedData === "object") {
          setNoteData(parsedData);

          // 일정 데이터 생성
          const schedule = generateScheduleFromNote(parsedData);
          setScheduleData(schedule);

          // 이미 노트가 있으면 여행 계획 페이지로 이동
          if (!isNavigatingRef.current) {
            isNavigatingRef.current = true;
            router.replace(`/travel/${tripId}`);
          }
          return;
        }
      }

      // 저장된 노트가 없으면 테마 콘텐츠로 자동 생성
      const themeContentRaw = sessionStorage.getItem("selectedThemeContent");
      if (
        themeContentRaw &&
        themeContentRaw !== "undefined" &&
        themeContentRaw !== "null"
      ) {
        const themeContent: ThemeContent = JSON.parse(themeContentRaw);
        const autoNote: TravelNoteData = {
          tripId,
          themeContent,
          clarifierAnswers: {},
          userProfileSummary: "",
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(
          `travelNote_${tripId}`,
          JSON.stringify(autoNote)
        );
        setNoteData(autoNote);
        const schedule = generateScheduleFromNote(autoNote);
        setScheduleData(schedule);

        if (!isNavigatingRef.current) {
          isNavigatingRef.current = true;
          router.replace(`/travel/${tripId}`);
        }
        return;
      }

      // 데이터가 없으면 더미 데이터 사용 (개발/테스트용)
      console.log("📌 Using dummy data for testing");
      setScheduleData(DUMMY_SCHEDULE_DATA);
    } catch (error) {
      console.error("여행노트 데이터 로드 에러:", error);
      // 에러 발생 시에도 더미 데이터 사용
      console.log("📌 Using dummy data due to error");
      setScheduleData(DUMMY_SCHEDULE_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const currentDayData = scheduleData?.days.find((d) => d.day === currentDay);

  // 지도에 표시할 장소 데이터 변환
  const mapPlaces: PlaceLocation[] = useMemo(() => {
    if (!currentDayData) return [];

    return currentDayData.places
      .filter((place) => place.location) // 위치 정보가 있는 장소만
      .map((place) => ({
        id: place.id,
        name: place.name,
        location: place.location!,
      }));
  }, [currentDayData]);

  // 경로 세그먼트 (지도에 전달)
  const routeSegments: RouteSegment[] | undefined = routeData?.segments;

  // 장소가 변경되면 경로 계산
  useEffect(() => {
    const fetchRoute = async () => {
      if (mapPlaces.length > 1) {
        setIsCalculatingRoute(true);
        console.log("🔄 Calculating route for", mapPlaces.length, "places");
        try {
          const route = await calculateRoute(mapPlaces);
          if (route) {
            console.log("✅ Route calculated successfully");
            setRouteData(route);
          } else {
            console.warn("⚠️ No route returned");
            setRouteData(null);
          }
        } catch (error) {
          console.error("❌ Route calculation failed:", error);
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

  // 드래그 시작
  const handleDragStart = useCallback(
    (clientY: number) => {
      isDragging.current = true;
      startY.current = clientY;
      startHeight.current = sheetHeight;
      currentHeightRef.current = sheetHeight;
    },
    [sheetHeight]
  );

  // 드래그 중
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = startY.current - clientY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.min(
      85,
      Math.max(25, startHeight.current + deltaPercent)
    );

    currentHeightRef.current = newHeight; // ref도 업데이트
    setSheetHeight(newHeight);
  }, []);

  // 드래그 종료 - 가장 가까운 스냅 포인트로 이동
  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // 스냅 포인트: 25%, 50%, 85% (3단계)
    const snapPoints = [25, 50, 85];
    const currentHeight = currentHeightRef.current;

    // 현재 높이에서 가장 가까운 스냅 포인트 찾기
    let closestSnap = snapPoints[0];
    let minDistance = Math.abs(currentHeight - snapPoints[0]);

    for (const snap of snapPoints) {
      const distance = Math.abs(currentHeight - snap);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = snap;
      }
    }

    currentHeightRef.current = closestSnap;
    setSheetHeight(closestSnap);
  }, []); // 의존성 제거 - ref 사용

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => {
      handleDragEnd();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (scheduleData && currentDay < scheduleData.totalDays) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmSchedule = () => {
    setShowConfirmModal(false);
    // 일정 확정 로직 - 여행 중으로 상태 변경 등
    router.push("/notes");
  };

  // 날짜 선택 관련 핸들러
  const handleOpenDatePicker = () => {
    // 현재 날짜 설정
    if (scheduleData?.startDate) {
      const parts = scheduleData.startDate.split(".");
      if (parts.length >= 3) {
        setCurrentMonth(
          new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1)
        );
        setSelectedStartDate(
          new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
          )
        );
      }
    }
    if (scheduleData?.endDate) {
      const parts = scheduleData.endDate.split(".");
      if (parts.length >= 2) {
        const year =
          scheduleData.startDate?.split(".")[0] ||
          new Date().getFullYear().toString();
        setSelectedEndDate(
          new Date(parseInt(year), parseInt(parts[0]) - 1, parseInt(parts[1]))
        );
      }
    }
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      if (date < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const handleConfirmDate = () => {
    if (selectedStartDate && selectedEndDate && scheduleData) {
      const formatDate = (d: Date) =>
        `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}.${String(d.getDate()).padStart(2, "0")}`;
      const formatShortDate = (d: Date) =>
        `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
          d.getDate()
        ).padStart(2, "0")}`;

      setScheduleData({
        ...scheduleData,
        startDate: formatDate(selectedStartDate),
        endDate: formatShortDate(selectedEndDate),
      });
    }
    setShowDatePicker(false);
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
  const getCalendarDays = () => {
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
  };

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

  const getDayOfWeek = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[date.getDay()];
  };

  // 로딩 중 UI
  if (isLoading) {
    return (
      <PageContainer ref={containerRef}>
        <MapSection $bottomOffset={400}>
          <GoogleMapView places={[]} />
          <BackButton onClick={() => router.back()}>
            <BackIcon />
          </BackButton>
        </MapSection>
      </PageContainer>
    );
  }

  // 데이터 없음 UI
  if (!scheduleData) {
    return (
      <PageContainer ref={containerRef}>
        <MapSection $bottomOffset={400}>
          <GoogleMapView places={[]} />
          <BackButton onClick={() => router.back()}>
            <BackIcon />
          </BackButton>
        </MapSection>
        <BottomSheetContainer $height={40}>
          <BottomSheet>
            <SheetContent>
              <EmptyFavorites>
                <PinIcon active={false} />
                <p>
                  여행노트 데이터를 찾을 수 없습니다.
                  <br />
                  다시 여행을 계획해주세요.
                </p>
              </EmptyFavorites>
            </SheetContent>
          </BottomSheet>
        </BottomSheetContainer>
        <BottomBar>
          <ConfirmButton onClick={() => router.push("/chat")}>
            새로운 여행 계획하기
          </ConfirmButton>
        </BottomBar>
      </PageContainer>
    );
  }

  // 지도 하단 오프셋 계산 (바텀시트 높이 + 하단바 - 둥근 상단 여유)
  const mapBottomOffset =
    Math.round(
      (sheetHeight / 100) * (containerRef.current?.offsetHeight || 800)
    ) +
    84 -
    24; // 24px 내려서 바텀시트 둥근 상단(radius) 보이게

  return (
    <PageContainer ref={containerRef}>
      <MapSection $bottomOffset={mapBottomOffset}>
        <GoogleMapView places={mapPlaces} routeSegments={routeSegments} />
        <BackButton onClick={() => router.back()}>
          <BackIcon />
        </BackButton>
      </MapSection>

      <BottomSheetContainer $height={sheetHeight}>
        <BottomSheet>
          <DragHandleArea
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <DragHandle />
          </DragHandleArea>

          <SheetContent>
            <TabContainer>
              <Tab
                $active={activeTab === "schedule"}
                onClick={() => setActiveTab("schedule")}
              >
                <PinIcon active={activeTab === "schedule"} />
                <TabText $active={activeTab === "schedule"}>일정</TabText>
              </Tab>
              <Tab
                $active={activeTab === "favorites"}
                onClick={() => setActiveTab("favorites")}
              >
                <HeartIcon active={activeTab === "favorites"} />
                <TabText $active={activeTab === "favorites"}>즐겨찾기</TabText>
              </Tab>
            </TabContainer>

            {activeTab === "schedule" ? (
              <>
                <DayHeader>
                  <DayTitle>Day {currentDay}</DayTitle>
                  <DayNavigation>
                    <NavButton
                      $disabled={currentDay === 1}
                      onClick={handlePrevDay}
                    >
                      <ChevronLeftIcon />
                    </NavButton>
                    <NavButton
                      $disabled={currentDay === scheduleData.totalDays}
                      onClick={handleNextDay}
                    >
                      <ChevronRightIcon />
                    </NavButton>
                  </DayNavigation>
                </DayHeader>

                <DateInfoRow>
                  <DateInfo
                    onClick={handleOpenDatePicker}
                    style={{ cursor: "pointer" }}
                  >
                    <CalendarIcon />
                    <DateText>
                      {scheduleData.startDate}
                      {scheduleData.endDate && ` ~ ${scheduleData.endDate}`}
                    </DateText>
                  </DateInfo>
                  <EditButton onClick={handleOpenDatePicker}>편집</EditButton>
                </DateInfoRow>

                <TimelineContainer>
                  <TimelineLine />
                  {currentDayData?.places.map((place, index) => {
                    // 현재 장소와 다음 장소 사이의 경로 정보 찾기
                    const segment = routeData?.segments.find(
                      (seg) => seg.origin.id === place.id
                    );

                    return (
                      <ScheduleItem key={place.id}>
                        <MarkerContainer>
                          <Marker $checked={place.checked}>
                            {place.checked && <CheckIcon />}
                          </Marker>
                        </MarkerContainer>
                        <PlaceCard>
                          <PlaceName>{place.name}</PlaceName>
                        </PlaceCard>
                        {index < (currentDayData?.places.length || 0) - 1 && (
                          <TravelInfo>
                            {segment ? (
                              <>
                                <TravelInfoText>
                                  {formatDistance(segment.distanceMeters)}
                                </TravelInfoText>
                                <TravelInfoText>
                                  {formatDuration(
                                    segment.travelDurationSeconds ||
                                      segment.durationSeconds
                                  )}
                                </TravelInfoText>
                              </>
                            ) : isCalculatingRoute ? (
                              <TravelInfoText>계산 중...</TravelInfoText>
                            ) : (
                              <>
                                <TravelInfoText>거리 정보 없음</TravelInfoText>
                              </>
                            )}
                          </TravelInfo>
                        )}
                      </ScheduleItem>
                    );
                  })}
                </TimelineContainer>
              </>
            ) : (
              <EmptyFavorites>
                <HeartIcon active={false} />
                <p>즐겨찾기한 장소가 없습니다.</p>
              </EmptyFavorites>
            )}
          </SheetContent>
        </BottomSheet>
      </BottomSheetContainer>

      {/* 플로팅 채팅 버튼 */}
      <FloatingChatButton onClick={() => router.push("/chat")}>
        <ChatIcon />
      </FloatingChatButton>

      <BottomBar>
        <ConfirmButton onClick={handleOpenConfirmModal}>
          일정 확정하기
        </ConfirmButton>
      </BottomBar>

      {/* 일정 확정 모달 */}
      {showConfirmModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalContent>
              <ModalTitle>일정 확정</ModalTitle>
              <ModalDescription>이대로 여행을 시작할까요?</ModalDescription>
            </ModalContent>
            <ModalButtonGroup>
              <ModalButton onClick={handleCloseModal}>취소</ModalButton>
              <ModalButton $primary onClick={handleConfirmSchedule}>
                확인
              </ModalButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 날짜 선택 모달 */}
      {showDatePicker && (
        <DatePickerOverlay>
          <DatePickerContainer>
            <DatePickerHeader>
              <DatePickerTitle>일정 선택</DatePickerTitle>
              <DatePickerDateRange>
                <CalendarIcon />
                <span>
                  {scheduleData?.startDate}
                  {scheduleData?.endDate && ` ~ ${scheduleData.endDate}`}
                </span>
              </DatePickerDateRange>
            </DatePickerHeader>

            <MonthHeader>
              <MonthTitle>
                {currentMonth.getFullYear()}.{" "}
                {String(currentMonth.getMonth() + 1).padStart(2, "0")}
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
              <WeekRow>
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <DayLabel key={day}>{day}</DayLabel>
                ))}
              </WeekRow>
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

                      return (
                        <DayCell
                          key={dayIndex}
                          $selected={isSelected}
                          $inRange={inRange}
                          $disabled={!dayData.isCurrentMonth}
                          $isStart={isStart}
                          $isEnd={isEnd}
                          onClick={() =>
                            dayData.isCurrentMonth &&
                            handleDateSelect(dayData.date)
                          }
                        >
                          {dayData.date.getDate()}
                        </DayCell>
                      );
                    })}
                </WeekRow>
              ))}
            </CalendarGrid>

            <div style={{ flex: 1 }} />

            <DateSummary>
              <DateSummaryItem>
                <DateSummaryLabel>가는날</DateSummaryLabel>
                <DateSummaryValue>
                  {selectedStartDate
                    ? `${selectedStartDate.getFullYear()}.${String(
                        selectedStartDate.getMonth() + 1
                      ).padStart(2, "0")}.${String(
                        selectedStartDate.getDate()
                      ).padStart(2, "0")} (${getDayOfWeek(selectedStartDate)})`
                    : "-"}
                </DateSummaryValue>
              </DateSummaryItem>
              <DateSummaryItem>
                <DateSummaryLabel>오는날</DateSummaryLabel>
                <DateSummaryValue>
                  {selectedEndDate
                    ? `${selectedEndDate.getFullYear()}.${String(
                        selectedEndDate.getMonth() + 1
                      ).padStart(2, "0")}.${String(
                        selectedEndDate.getDate()
                      ).padStart(2, "0")} (${getDayOfWeek(selectedEndDate)})`
                    : "-"}
                </DateSummaryValue>
              </DateSummaryItem>
            </DateSummary>

            <DatePickerFooter>
              <DatePickerButton onClick={handleCloseDatePicker}>
                취소
              </DatePickerButton>
              <DatePickerButton $primary onClick={handleConfirmDate}>
                확인
              </DatePickerButton>
            </DatePickerFooter>
          </DatePickerContainer>
        </DatePickerOverlay>
      )}
    </PageContainer>
  );
}
