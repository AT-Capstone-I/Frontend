"use client";

import { useState } from "react";
import styled from "styled-components";

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
const RecommendHeader = styled.div`
  margin-bottom: 20px;
`;

const WeatherMessage = styled.div`
  background-color: #f0f7ff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;

  p {
    font-family: 'Pretendard', sans-serif;
    font-size: 14px;
    color: var(--greyscale-1200, #111111);
    line-height: 1.5;

    strong {
      color: var(--primary-500, #4f9de8);
    }
  }
`;

const RecommendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const RecommendCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-000, #ffffff);
  border: 1px solid var(--greyscale-300, #e1e1e4);
`;

const RecommendImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
`;

const RecommendInfo = styled.div`
  padding: 10px;
`;

const RecommendName = styled.h4`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--greyscale-1200, #111111);
  margin-bottom: 2px;
`;

const RecommendDesc = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  color: var(--greyscale-600, #918e94);
`;

const QuestionSection = styled.div`
  margin-top: 24px;
`;

const QuestionTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--greyscale-1200, #111111);
  margin-bottom: 12px;
`;

// ============ 작성한 리뷰 탭 스타일 ============
const ReviewItem = styled.div`
  margin-bottom: 24px;
`;

const ReviewNumber = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--greyscale-1200, #111111);
  margin-bottom: 12px;
`;

const ReviewContent = styled.div`
  padding: 16px;
  background-color: var(--greyscale-100, #f5f5f5);
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: var(--greyscale-800, #5e5b61);
  margin-bottom: 12px;
`;

const ReviewImagePlaceholder = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--greyscale-300, #e1e1e4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-600, #918e94);
  font-size: 12px;
`;

// ============ 아이콘 컴포넌트 ============
const CheckmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
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

const recommendData = [
  {
    id: 1,
    name: "순이네횟상",
    desc: "전남 여수시 돌산읍읍길 5 18...",
    image: "https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    name: "모아산 스카이점",
    desc: "전라남도, 여수시 돌산로 무슬...",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=300&h=200&fit=crop",
  },
];

const reviewData = [
  {
    id: 1,
    placeName: "여행지 이름",
    content: "리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다. 리뷰 내용이 들어갑니다.",
  },
  {
    id: 2,
    placeName: "여행지 이름",
    content: "",
  },
];

// ============ 메인 컴포넌트 ============
export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "recommend" | "review">("schedule");
  const [selectedDate, setSelectedDate] = useState(0);

  const handleChatClick = () => {
    // 채팅 페이지로 이동 또는 채팅 모달 열기
    window.location.href = "/chat";
  };

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

            <AskButton onClick={handleChatClick}>
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

            <WeatherMessage>
              <p>
                <strong>현재 비가 내리고 있어요.</strong>
                <br />
                비오는 날, 인기 플레이스를 추천해요.
              </p>
            </WeatherMessage>

            <RecommendGrid>
              {recommendData.map((item) => (
                <RecommendCard key={item.id}>
                  <RecommendImage src={item.image} alt={item.name} />
                  <RecommendInfo>
                    <RecommendName>{item.name}</RecommendName>
                    <RecommendDesc>{item.desc}</RecommendDesc>
                  </RecommendInfo>
                </RecommendCard>
              ))}
            </RecommendGrid>

            <QuestionSection>
              <QuestionTitle>다른 맛집을 찾고 계신가요?</QuestionTitle>
              <RecommendGrid>
                {recommendData.map((item) => (
                  <RecommendCard key={item.id}>
                    <RecommendImage src={item.image} alt={item.name} />
                    <RecommendInfo>
                      <RecommendName>{item.name}</RecommendName>
                      <RecommendDesc>{item.desc}</RecommendDesc>
                    </RecommendInfo>
                  </RecommendCard>
                ))}
              </RecommendGrid>
            </QuestionSection>
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
                <ReviewNumber>{index + 1}. 여행지 이름</ReviewNumber>
                {review.content ? (
                  <ReviewContent>{review.content}</ReviewContent>
                ) : (
                  <ReviewImagePlaceholder>이미지</ReviewImagePlaceholder>
                )}
              </ReviewItem>
            ))}
          </>
        )}
      </Content>

    </PageWrapper>
  );
}
