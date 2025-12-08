"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

// Google Forms 설문 링크
const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdhvVMPwQN1QBTLc5g2TBaYnzjhQl0TufxPi9ObDvqEZAUWUg/viewform?usp=publish-editor";

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

const TripTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.12px;
  color: var(--greyscale-1200, #111111);
`;

// 날짜 선택 버튼
const DateSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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

// 타임라인
const Timeline = styled.div`
  position: relative;
  padding-left: 31px;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 7px;
  top: 15px;
  bottom: 70px;
  width: 1px;
  background-color: var(--greyscale-300, #e1e1e4);
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

// 체크 아이콘
const CheckIcon = styled.div<{ $completed: boolean }>`
  position: absolute;
  left: -31px;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ $completed }) => ($completed ? "var(--greyscale-1200, #111111)" : "var(--greyscale-000, #ffffff)")};
  border: 1px solid ${({ $completed }) => ($completed ? "var(--greyscale-1200, #111111)" : "var(--greyscale-400, #c4c2c6)")};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 9px;
    height: 9px;
    color: #ffffff;
    display: ${({ $completed }) => ($completed ? "block" : "none")};
  }
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

// ============ 실시간 추천 탭 스타일 ============
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
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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

  &:hover {
    transform: scale(1.1);
  }

  svg {
    width: 18px;
    height: 15px;
    fill: ${({ $filled }) => ($filled ? '#FD818B' : 'none')};
    stroke: ${({ $filled }) => ($filled ? '#FD818B' : '#ffffff')};
    stroke-width: 2;
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
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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

// ============ 스토리 사진 생성 화면 스타일 ============
const StoryCreatorWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #ffffff);
  display: flex;
  flex-direction: column;
`;

const StoryHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--greyscale-200, #f2f1f2);
`;

const StoryBackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--greyscale-900, #444246);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const StoryHeaderTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--greyscale-1200, #111111);
  margin: 0;
`;

const StoryHeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const StoryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 24px;
`;

const StoryImagePlaceholder = styled.div`
  width: 280px;
  height: 400px;
  background-color: var(--greyscale-100, #f5f5f5);
  border: 2px dashed var(--greyscale-300, #e1e1e4);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const StoryPlaceholderIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: var(--greyscale-200, #f2f1f2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-500, #aaa8ad);

  svg {
    width: 32px;
    height: 32px;
  }
`;

const StoryPlaceholderText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--greyscale-600, #918e94);
  text-align: center;
  margin: 0;
`;

const StoryDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--greyscale-700, #77747b);
  text-align: center;
  max-width: 280px;
  margin: 0;
`;

const StoryBottomBar = styled.div`
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--greyscale-200, #f2f1f2);
`;

const StoryGenerateButton = styled.button`
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
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-1000, #2b2a2c);
  }

  &:disabled {
    background-color: var(--greyscale-300, #e1e1e4);
    cursor: not-allowed;
  }
`;

// ============ 아이콘 컴포넌트 ============
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 18 15" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 14.5L1.5 7.5C0.5 6.5 0 5.5 0 4C0 1.5 2 0 4.5 0C6 0 7.5 0.8 9 2.5C10.5 0.8 12 0 13.5 0C16 0 18 1.5 18 4C18 5.5 17.5 6.5 16.5 7.5L9 14.5Z" />
  </svg>
);

// ============ 샘플 데이터 ============
const scheduleData = {
  tripTitle: "여수 여행",
  tripSubtitle: "바다와 함께하는 카페 투어",
  dates: ["11. 12", "11. 13", "11. 14", "11. 15"],
  places: [
    {
      id: 1,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      completed: true,
      transit: { distance: "도보 385m", duration: "20분" },
    },
    {
      id: 2,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      completed: true,
      transit: { distance: "도보 385m", duration: "20분" },
    },
    {
      id: 3,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      completed: false,
      transit: { distance: "도보 385m", duration: "20분" },
    },
  ],
};

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

const reviewData = [
  {
    id: 1,
    placeName: "여행지 이름",
    images: [
      "https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=300&h=300&fit=crop",
    ],
    content: "리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다.",
  },
  {
    id: 2,
    placeName: "여행지 이름",
    images: [
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop",
    ],
    content: "리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다.",
  },
];

// ============ 메인 컴포넌트 ============
export default function SchedulePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"schedule" | "recommend" | "review">("schedule");
  const [selectedDate, setSelectedDate] = useState(0);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  // 여행지 ID (실제로는 서버에서 받아오거나 상태로 관리)
  // URL 쿼리 파라미터나 컨텍스트에서 가져올 수 있음
  const currentTripRegion = "yeosu"; // 여수 여행 샘플

  const handleTripEndClick = () => {
    // 새 탭으로 설문 링크 열기
    window.open(SURVEY_URL, "_blank");
    // 스토리 페이지로 이동 (지역별 URL)
    router.push(`/schedule/story/${currentTripRegion}`);
  };

  const handleBackFromStory = () => {
    setShowStoryCreator(false);
  };

  const handleGenerateStory = () => {
    // TODO: 스토리 사진 생성 로직 구현 예정
    console.log("스토리 사진 생성");
  };

  // 스토리 사진 생성 화면
  if (showStoryCreator) {
    return (
      <StoryCreatorWrapper>
        <StoryHeader>
          <StoryBackButton onClick={handleBackFromStory}>
            <BackArrowIcon />
          </StoryBackButton>
          <StoryHeaderTitle>스토리 사진 생성</StoryHeaderTitle>
          <StoryHeaderSpacer />
        </StoryHeader>

        <StoryContent>
          <StoryImagePlaceholder>
            <StoryPlaceholderIcon>
              <ImageIcon />
            </StoryPlaceholderIcon>
            <StoryPlaceholderText>
              여행 사진으로<br />스토리를 만들어보세요
            </StoryPlaceholderText>
          </StoryImagePlaceholder>

          <StoryDescription>
            오늘의 여행 사진들을 선택하면<br />
            AI가 멋진 스토리 이미지를 생성해드려요
          </StoryDescription>
        </StoryContent>

        <StoryBottomBar>
          <StoryGenerateButton onClick={handleGenerateStory}>
            스토리 만들기
          </StoryGenerateButton>
        </StoryBottomBar>
      </StoryCreatorWrapper>
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
        <TabButton $active={activeTab === "review"} onClick={() => setActiveTab("review")}>
          작성한 리뷰
        </TabButton>
      </TabNavigation>

      <Content>
        {activeTab === "schedule" && (
          <>
            <TripHeader>
              <TripSubtitle>{scheduleData.tripSubtitle}</TripSubtitle>
              <TripTitle>{scheduleData.tripTitle}</TripTitle>
            </TripHeader>

            <DateSelector>
              {scheduleData.dates.map((date, index) => (
                <DateButton
                  key={date}
                  $active={selectedDate === index}
                  onClick={() => setSelectedDate(index)}
                >
                  {date}
                </DateButton>
              ))}
            </DateSelector>

            <DayHeader>
              <DayLabel>{selectedDate + 1}일차</DayLabel>
              <EditButton>편집</EditButton>
            </DayHeader>

            <Timeline>
              <TimelineLine />
              {scheduleData.places.map((place, index) => (
                <TimelineItem key={place.id}>
                  <CheckIcon $completed={place.completed}>
                    <CheckmarkIcon />
                  </CheckIcon>
                  <ScheduleCard>
                    <CardContent>
                      <PlaceInfo>
                        <PlaceName>{place.name}</PlaceName>
                        <PlaceAddress>{place.address}</PlaceAddress>
                      </PlaceInfo>
                      <ReviewButton>리뷰 작성하기</ReviewButton>
                    </CardContent>
                  </ScheduleCard>
                  {index < scheduleData.places.length - 1 && (
                    <TransitInfo>
                      <TransitText>{place.transit.distance}</TransitText>
                      <TransitText>{place.transit.duration}</TransitText>
                    </TransitInfo>
                  )}
                </TimelineItem>
              ))}
            </Timeline>

            <AskButton onClick={handleTripEndClick}>
              오늘 여행은 어떠셨나요?
            </AskButton>
          </>
        )}

        {activeTab === "recommend" && (
          <>
            <TripHeader>
              <TripSubtitle>바다와 함께하는 카페 투어</TripSubtitle>
              <TripTitle>여수 여행</TripTitle>
            </TripHeader>

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
                        <HeartIcon />
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
                        <HeartIcon />
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

        {activeTab === "review" && (
          <>
            <TripHeader>
              <TripSubtitle>바다와 함께하는 카페 투어</TripSubtitle>
              <TripTitle>여수 여행</TripTitle>
            </TripHeader>

            <DateSelector>
              {scheduleData.dates.map((date, index) => (
                <DateButton
                  key={date}
                  $active={selectedDate === index}
                  onClick={() => setSelectedDate(index)}
                >
                  {date}
                </DateButton>
              ))}
            </DateSelector>

            {reviewData.map((review, index) => (
              <ReviewItem key={review.id}>
                <ReviewHeader>
                  <ReviewTitle>{index + 1}. {review.placeName}</ReviewTitle>
                  <ReviewEditButton>편집</ReviewEditButton>
                </ReviewHeader>
                {review.images && review.images.length > 0 && (
                  <ReviewImageScroll>
                    {review.images.map((image, imgIndex) => (
                      <ReviewImageBox key={imgIndex}>
                        <ReviewImage src={image} alt={`리뷰 이미지 ${imgIndex + 1}`} />
                      </ReviewImageBox>
                    ))}
                  </ReviewImageScroll>
                )}
                {review.content && (
                  <ReviewContent>{review.content}</ReviewContent>
                )}
              </ReviewItem>
            ))}
          </>
        )}
      </Content>

    </PageWrapper>
  );
}
