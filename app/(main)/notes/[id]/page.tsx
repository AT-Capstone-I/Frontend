"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { ThemeContent } from "@/app/lib/api";

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
  background-color: var(--greyscale-000, #FFFFFF);
  position: relative;
  overflow: hidden;
`;

const MapSection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E8E8E8;
  overflow: hidden;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-600, #918E94);
  font-size: 14px;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 44px;
  height: 44px;
  background-color: var(--greyscale-000, #FFFFFF);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
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
  bottom: 80px;
  height: ${({ $height }) => $height}%;
  min-height: 200px;
  max-height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
  transition: height 0.15s ease-out;
  z-index: 20;
`;

const BottomSheet = styled.div`
  flex: 1;
  background-color: var(--greyscale-000, #FFFFFF);
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
  width: 40px;
  height: 5px;
  background-color: #C4C2C6;
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
  background-color: var(--greyscale-200, #F2F1F2);
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
  background-color: ${({ $active }) => ($active ? "var(--greyscale-000, #FFFFFF)" : "transparent")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const TabText = styled.span<{ $active: boolean }>`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ $active }) => ($active ? "var(--greyscale-1000, #2B2A2C)" : "var(--greyscale-800, #5E5B61)")};
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 8px;
`;

const DayTitle = styled.h2`
  font-family: 'Pretendard', sans-serif;
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
  background-color: var(--greyscale-100, #F7F7F7);
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $disabled }) => ($disabled ? "var(--greyscale-500, #AAA8AD)" : "var(--greyscale-1200, #111111)")};
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
    color: var(--greyscale-700, #77747B);
  }
`;

const DateText = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747B);
`;

const EditButton = styled.button`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747B);
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
  background-color: var(--greyscale-300, #E1E1E4);
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
  border: 1px solid var(--greyscale-400, #C4C2C6);
  background-color: ${({ $checked }) => ($checked ? "var(--greyscale-900, #444246)" : "var(--greyscale-000, #FFFFFF)")};
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
  background-color: var(--greyscale-000, #FFFFFF);
  border: 1px solid var(--greyscale-300, #E1E1E4);
  border-radius: 12px;
`;

const PlaceName = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2B2A2C);
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
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-700, #77747B);
`;

const BottomBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--greyscale-000, #FFFFFF);
  padding: 12px 20px;
  border-top: 1px solid var(--greyscale-200, #F2F1F2);
  z-index: 30;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 18px 32px;
  background-color: var(--greyscale-900, #444246);
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-000, #FFFFFF);
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
  background-color: var(--greyscale-000, #FFFFFF);
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
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.12px;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const ModalDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-800, #5E5B61);
  margin: 0;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  border-top: 1px solid var(--greyscale-300, #E1E1E4);
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: ${({ $primary }) => ($primary ? 600 : 400)};
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: ${({ $primary }) => ($primary ? "var(--greyscale-1200, #111111)" : "var(--greyscale-600, #918E94)")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-100, #F7F7F7);
  }

  &:first-child {
    border-right: 1px solid var(--greyscale-300, #E1E1E4);
  }
`;

const EmptyFavorites = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--greyscale-600, #918E94);

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-family: 'Pretendard', sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const TripHeader = styled.div`
  padding: 0 20px 16px;
  border-bottom: 1px solid var(--greyscale-200, #F2F1F2);
  margin-bottom: 16px;
`;

const TripTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.12px;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const TripSubtitle = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-700, #77747B);
  margin: 4px 0 0 0;
`;

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// 여행노트 데이터에서 일정 데이터 생성 헬퍼 함수
const generateScheduleFromNote = (noteData: TravelNoteData): ScheduleData => {
  const { themeContent, clarifierAnswers } = noteData;
  
  // 날짜 정보 추출 (clarifierAnswers에서)
  const startDateAnswer = clarifierAnswers?.start_date || '';
  const today = new Date();
  const startDate = startDateAnswer || `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  
  // place_ids에서 장소 목록 생성
  const placeIds = themeContent?.place_ids || [];
  const carouselImages = themeContent?.carousel_images || [];
  
  // 장소명 매핑 (carousel_images에서 place_name 추출)
  const placeNameMap: Record<string, string> = {};
  carouselImages.forEach(img => {
    placeNameMap[img.place_id] = img.place_name;
  });
  
  // 하루에 3-4개 장소씩 배분
  const placesPerDay = 4;
  const days: DayData[] = [];
  
  for (let i = 0; i < placeIds.length; i += placesPerDay) {
    const dayPlaces = placeIds.slice(i, i + placesPerDay).map((placeId, idx) => ({
      id: placeId,
      name: placeNameMap[placeId] || `장소 ${i + idx + 1}`,
      checked: false,
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
      places: [{ id: '1', name: '장소를 추가해주세요', checked: false }],
    });
  }
  
  return {
    id: noteData.tripId,
    title: themeContent?.city_name || '여행',
    subtitle: themeContent?.theme_phrase || '',
    startDate,
    endDate: '',
    totalDays: days.length,
    days,
  };
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"schedule" | "favorites">("schedule");
  const [currentDay, setCurrentDay] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(65); // 초기 높이 65%
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  
  // 여행노트 데이터 상태
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteData, setNoteData] = useState<TravelNoteData | null>(null);

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
      if (storedData && storedData !== 'undefined' && storedData !== 'null') {
        const parsedData: TravelNoteData = JSON.parse(storedData);
        
        // 파싱된 객체가 유효한지 확인
        if (parsedData && typeof parsedData === 'object') {
          setNoteData(parsedData);
          
          // 일정 데이터 생성
          const schedule = generateScheduleFromNote(parsedData);
          setScheduleData(schedule);
        }
      }
    } catch (error) {
      console.error('여행노트 데이터 로드 에러:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const currentDayData = scheduleData?.days.find(d => d.day === currentDay);

  // 드래그 시작
  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    startHeight.current = sheetHeight;
  }, [sheetHeight]);

  // 드래그 중
  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = startY.current - clientY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.min(85, Math.max(25, startHeight.current + deltaPercent));
    
    setSheetHeight(newHeight);
  }, []);

  // 드래그 종료
  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // 스냅 포인트: 25%, 65%, 85%
    if (sheetHeight < 40) {
      setSheetHeight(25);
    } else if (sheetHeight < 75) {
      setSheetHeight(65);
    } else {
      setSheetHeight(85);
    }
  }, [sheetHeight]);

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

  // 로딩 중 UI
  if (isLoading) {
    return (
      <PageContainer ref={containerRef}>
        <MapSection>
          <MapPlaceholder>로딩 중...</MapPlaceholder>
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
        <MapSection>
          <MapPlaceholder>여행노트를 찾을 수 없습니다</MapPlaceholder>
          <BackButton onClick={() => router.back()}>
            <BackIcon />
          </BackButton>
        </MapSection>
        <BottomSheetContainer $height={40}>
          <BottomSheet>
            <SheetContent>
              <EmptyFavorites>
                <PinIcon />
                <p>여행노트 데이터를 찾을 수 없습니다.<br />다시 여행을 계획해주세요.</p>
              </EmptyFavorites>
            </SheetContent>
          </BottomSheet>
        </BottomSheetContainer>
        <BottomBar>
          <ConfirmButton onClick={() => router.push('/chat')}>
            새로운 여행 계획하기
          </ConfirmButton>
        </BottomBar>
      </PageContainer>
    );
  }

  return (
    <PageContainer ref={containerRef}>
      <MapSection>
        <MapPlaceholder>
          {scheduleData.title} 지도
        </MapPlaceholder>
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
            {/* 여행 제목 표시 */}
            <TripHeader>
              <TripTitle>{scheduleData.title}</TripTitle>
              {scheduleData.subtitle && (
                <TripSubtitle>{scheduleData.subtitle}</TripSubtitle>
              )}
            </TripHeader>
            
            <TabContainer>
              <Tab $active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>
                <PinIcon />
                <TabText $active={activeTab === "schedule"}>일정</TabText>
              </Tab>
              <Tab $active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")}>
                <HeartIcon />
                <TabText $active={activeTab === "favorites"}>즐겨찾기</TabText>
              </Tab>
            </TabContainer>

            {activeTab === "schedule" ? (
              <>
                <DayHeader>
                  <DayTitle>Day {currentDay}</DayTitle>
                  <DayNavigation>
                    <NavButton $disabled={currentDay === 1} onClick={handlePrevDay}>
                      <ChevronLeftIcon />
                    </NavButton>
                    <NavButton $disabled={currentDay === scheduleData.totalDays} onClick={handleNextDay}>
                      <ChevronRightIcon />
                    </NavButton>
                  </DayNavigation>
                </DayHeader>

                <DateInfoRow>
                  <DateInfo>
                    <CalendarIcon />
                    <DateText>
                      {scheduleData.startDate}
                      {scheduleData.endDate && ` ~ ${scheduleData.endDate}`}
                    </DateText>
                  </DateInfo>
                  <EditButton>편집</EditButton>
                </DateInfoRow>

                <TimelineContainer>
                  <TimelineLine />
                  {currentDayData?.places.map((place, index) => (
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
                          <TravelInfoText>도보 385m</TravelInfoText>
                          <TravelInfoText>20분</TravelInfoText>
                        </TravelInfo>
                      )}
                    </ScheduleItem>
                  ))}
                </TimelineContainer>
              </>
            ) : (
              <EmptyFavorites>
                <HeartIcon />
                <p>즐겨찾기한 장소가 없습니다.</p>
              </EmptyFavorites>
            )}
          </SheetContent>
        </BottomSheet>
      </BottomSheetContainer>

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
              <ModalButton $primary onClick={handleConfirmSchedule}>확인</ModalButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

