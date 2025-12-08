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
import {
  DndContext,
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
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

// ============ 편집 모드 스타일 ============
const EditModeContainer = styled.div`
  padding: 0 20px;
`;

const DeleteButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--greyscale-400, #c4c2c6);
  background-color: var(--greyscale-000, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &::before {
    content: "";
    width: 10px;
    height: 1.5px;
    background-color: var(--greyscale-600, #918e94);
  }
`;

const EditPlaceCard = styled.div`
  flex: 1;
  padding: 14px;
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
`;

const DragHandleContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: grab;
  flex-shrink: 0;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const DragHandleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  span {
    display: block;
    width: 3px;
    height: 3px;
    background-color: var(--greyscale-500, #aaa8ad);
    border-radius: 50%;
  }
`;

const SortableItemWrapper = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  background-color: ${({ $isDragging }) => ($isDragging ? 'var(--greyscale-100, #f5f5f5)' : 'transparent')};
  border-radius: 12px;
  transition: opacity 0.2s ease, background-color 0.2s ease;
`;

const AddPlaceButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 8px;

  svg {
    width: 24px;
    height: 24px;
    color: var(--greyscale-600, #918e94);
  }
`;

const EditBottomBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--greyscale-000, #ffffff);
  padding: 12px 20px;
  display: flex;
  gap: 11px;
  z-index: 30;
`;

const EditCancelButton = styled.button`
  flex: 1;
  padding: 18px 32px;
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background-color: var(--greyscale-200, #f2f1f2);
  color: var(--greyscale-1000, #2b2a2c);
`;

const EditSaveButton = styled.button`
  flex: 1;
  padding: 18px 32px;
  border: none;
  border-radius: 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  background-color: var(--greyscale-900, #444246);
  color: white;
`;

// 삭제/저장 확인 모달 스타일
const EditModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const EditModalBox = styled.div`
  width: 280px;
  background-color: var(--greyscale-000, #ffffff);
  border-radius: 12px;
  overflow: hidden;
`;

const EditModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 20px 24px;
  text-align: center;
`;

const EditModalTitle = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const EditModalDescription = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--greyscale-700, #77747b);
  margin: 0;
`;

const EditModalButtonGroup = styled.div`
  display: flex;
  border-top: 1px solid var(--greyscale-300, #e1e1e4);
`;

const EditModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: ${({ $primary }) => ($primary ? 600 : 400)};
  line-height: 1.4;
  color: ${({ $primary }) =>
    $primary
      ? "var(--greyscale-1200, #111111)"
      : "var(--greyscale-600, #918E94)"};
  cursor: pointer;

  &:first-child {
    border-right: 1px solid var(--greyscale-300, #e1e1e4);
  }
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
  background-color: var(--greyscale-000, #ffffff);
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

// 뒤로가기 버튼이 있는 Top bar
const DatePickerTopBar = styled.div`
  display: flex;
  align-items: center;
  padding: 13px 20px;
  height: 50px;
`;

const DatePickerBackButton = styled.button`
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-900, #444246);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const DatePickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 13px;
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

const SmallCalendarIcon = styled.img`
  width: 14px;
  height: 14px;
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
  padding: 0 20px;
`;

const WeekRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DayLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 9px;
`;

const DayLabel = styled.span`
  width: 18px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--greyscale-900, #444246);
  text-align: center;
`;

// 날짜 셀 래퍼 - 배경색 연결을 위해
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
  height: 28px;

  /* 범위 배경 (시작~끝 사이 연결) */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: ${({ $isStart }) => ($isStart ? "50%" : "0")};
    right: ${({ $isEnd }) => ($isEnd ? "50%" : "0")};
    background-color: ${({ $inRange, $isStart, $isEnd, $isStartAndEnd }) =>
      $isStartAndEnd ? "transparent" : ($inRange || $isStart || $isEnd) ? "#F2F8FF" : "transparent"};
    z-index: 0;
  }
`;

const DayCell = styled.button<{
  $selected?: boolean;
  $disabled?: boolean;
}>`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background-color: ${({ $selected }) =>
    $selected ? "#66B2FE" : "transparent"};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $selected, $disabled }) =>
    $selected ? "white" : $disabled ? "#C4C2C6" : "#111111"};
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

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

// 탭 아이콘 스타일 (SVG 파일 사용)
const TabIcon = styled.img<{ $active?: boolean; $type: 'pin' | 'heart' }>`
  width: 24px;
  height: 24px;
  /* active 상태에 따른 색상 필터 */
  filter: ${({ $active, $type }) => {
    if ($active) {
      // active 상태: 파란색(일정) 또는 Red-400(즐겨찾기)
      return $type === 'pin' 
        ? 'brightness(0) saturate(100%) invert(55%) sepia(68%) saturate(456%) hue-rotate(175deg) brightness(97%) contrast(92%)'
        : 'brightness(0) saturate(100%) invert(65%) sepia(30%) saturate(1000%) hue-rotate(314deg) brightness(100%) contrast(98%)'; // Red-400 (#FD818B)
    }
    // inactive 상태: 회색
    return 'brightness(0) saturate(100%) invert(38%) sepia(5%) saturate(429%) hue-rotate(220deg) brightness(95%) contrast(88%)';
  }};
`;

// Figma 디자인에 맞춘 아이콘
const PinIcon = ({ active = false }: { active?: boolean }) => (
  <TabIcon 
    src="/assets/icons/pin.svg" 
    alt="일정" 
    $active={active}
    $type="pin"
  />
);

const HeartIcon = ({ active = false }: { active?: boolean }) => (
  <TabIcon 
    src="/assets/icons/heart.svg" 
    alt="즐겨찾기" 
    $active={active}
    $type="heart"
  />
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

// 플러스 아이콘 (편집 모드)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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

// 드래그 가능한 장소 아이템 컴포넌트
interface SortablePlaceItemProps {
  place: PlaceData;
  onDelete: (id: string) => void;
}

const SortablePlaceItem = ({ place, onDelete }: SortablePlaceItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableItemWrapper
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
    >
      <DeleteButton onClick={() => onDelete(place.id)} />
      <EditPlaceCard>
        <PlaceName>{place.name}</PlaceName>
      </EditPlaceCard>
      <DragHandleContainer {...attributes} {...listeners}>
        <DragHandleColumn>
          <span /><span /><span />
        </DragHandleColumn>
        <DragHandleColumn>
          <span /><span /><span />
        </DragHandleColumn>
      </DragHandleContainer>
    </SortableItemWrapper>
  );
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

  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPlaces, setEditPlaces] = useState<PlaceData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<string | null>(null);

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

  // ============ 편집 모드 관련 핸들러 ============
  const handleStartEdit = () => {
    if (currentDayData) {
      setEditPlaces([...currentDayData.places]);
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditPlaces([]);
  };

  const handleDeletePlace = (placeId: string) => {
    setPlaceToDelete(placeId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (placeToDelete) {
      setEditPlaces(editPlaces.filter((p) => p.id !== placeToDelete));
    }
    setShowDeleteModal(false);
    setPlaceToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlaceToDelete(null);
  };

  const handleSaveEdit = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    // 일정 데이터 업데이트
    if (scheduleData) {
      const updatedDays = scheduleData.days.map((day) => {
        if (day.day === currentDay) {
          return { ...day, places: editPlaces };
        }
        return day;
      });
      setScheduleData({ ...scheduleData, days: updatedDays });
    }
    setShowSaveModal(false);
    setIsEditMode(false);
    setEditPlaces([]);
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  // dnd-kit 센서 설정 (롱프레스로 드래그 활성화)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 움직여야 드래그 시작
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms 롱프레스 후 드래그 활성화
        tolerance: 5, // 5px 이내 움직임은 허용
      },
    })
  );

  // dnd-kit 드래그 종료 핸들러
  const handleSortDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditPlaces((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddPlace = () => {
    // TODO: 장소 추가 기능 구현 (검색 모달 등)
    const newPlace: PlaceData = {
      id: `new-${Date.now()}`,
      name: "새 여행지",
      checked: false,
    };
    setEditPlaces([...editPlaces, newPlace]);
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
                  <EditButton onClick={handleStartEdit}>편집</EditButton>
                </DateInfoRow>

                {isEditMode ? (
                  // 편집 모드 UI
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSortDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                  >
                    <SortableContext
                      items={editPlaces.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <EditModeContainer>
                        {editPlaces.map((place) => (
                          <SortablePlaceItem
                            key={place.id}
                            place={place}
                            onDelete={handleDeletePlace}
                          />
                        ))}
                        <AddPlaceButton onClick={handleAddPlace}>
                          <PlusIcon />
                        </AddPlaceButton>
                      </EditModeContainer>
                    </SortableContext>
                  </DndContext>
                ) : (
                  // 일반 모드 UI
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
                )}
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
      {!isEditMode && (
        <FloatingChatButton onClick={() => router.push("/chat")}>
          <ChatIcon />
        </FloatingChatButton>
      )}

      {/* 일반 모드: 일정 확정 버튼 / 편집 모드: 취소/저장 버튼 */}
      {isEditMode ? (
        <EditBottomBar>
          <EditCancelButton onClick={handleCancelEdit}>취소</EditCancelButton>
          <EditSaveButton onClick={handleSaveEdit}>저장</EditSaveButton>
        </EditBottomBar>
      ) : (
        <BottomBar>
          <ConfirmButton onClick={handleOpenConfirmModal}>
            일정 확정하기
          </ConfirmButton>
        </BottomBar>
      )}

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

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <EditModalOverlay onClick={handleCancelDelete}>
          <EditModalBox onClick={(e) => e.stopPropagation()}>
            <EditModalContent>
              <EditModalTitle>해당 여행지 삭제</EditModalTitle>
              <EditModalDescription>여행지를 삭제합니다.</EditModalDescription>
            </EditModalContent>
            <EditModalButtonGroup>
              <EditModalButton onClick={handleCancelDelete}>취소</EditModalButton>
              <EditModalButton $primary onClick={handleConfirmDelete}>
                확인
              </EditModalButton>
            </EditModalButtonGroup>
          </EditModalBox>
        </EditModalOverlay>
      )}

      {/* 저장 확인 모달 */}
      {showSaveModal && (
        <EditModalOverlay onClick={handleCancelSave}>
          <EditModalBox onClick={(e) => e.stopPropagation()}>
            <EditModalContent>
              <EditModalTitle>여행 저장</EditModalTitle>
              <EditModalDescription>즐거운 여행을 시작하세요.</EditModalDescription>
            </EditModalContent>
            <EditModalButtonGroup>
              <EditModalButton onClick={handleCancelSave}>취소</EditModalButton>
              <EditModalButton $primary onClick={handleConfirmSave}>
                확인
              </EditModalButton>
            </EditModalButtonGroup>
          </EditModalBox>
        </EditModalOverlay>
      )}

      {/* 날짜 선택 모달 */}
      {showDatePicker && (
        <DatePickerOverlay>
          <DatePickerContainer>
            {/* 뒤로가기 버튼 */}
            <DatePickerTopBar>
              <DatePickerBackButton onClick={handleCloseDatePicker}>
                <BackIcon />
              </DatePickerBackButton>
            </DatePickerTopBar>

            <DatePickerHeader>
              <DatePickerTitle>일정 선택</DatePickerTitle>
              <DatePickerDateRange>
                <SmallCalendarIcon src="/assets/icons/calendar.svg" alt="캘린더" />
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
                            onClick={() =>
                              dayData.isCurrentMonth &&
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
