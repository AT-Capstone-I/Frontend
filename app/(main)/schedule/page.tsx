"use client";

import { useState } from "react";
import styled from "styled-components";
import { ChatFab } from "@/app/components";

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 80px;
`;

const TabNavigation = styled.nav`
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 0;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--text-muted)")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--text-primary);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
  }
`;

const Content = styled.div`
  padding: 20px;
`;

// 내 일정 탭 스타일
const TripHeader = styled.div`
  margin-bottom: 16px;
`;

const TripSubtitle = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 4px;
`;

const TripTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const DateSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const DateButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid ${({ $active }) => ($active ? "var(--accent-color)" : "var(--border-color)")};
  background-color: ${({ $active }) => ($active ? "var(--accent-color)" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-secondary)")};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const DayLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  span {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  button {
    font-size: 12px;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: pointer;
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 20px;

  &::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background-color: var(--border-color);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding: 16px;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 12px;

  &::before {
    content: "";
    position: absolute;
    left: -17px;
    top: 20px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--accent-color);
    border: 2px solid #ffffff;
  }
`;

const PlaceName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const PlaceAddress = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const PlaceMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const WriteButton = styled.button`
  font-size: 12px;
  color: var(--accent-color);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
`;

const AskButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 20px;
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

// 실시간 추천 탭 스타일
const RecommendHeader = styled.div`
  margin-bottom: 20px;
`;

const WeatherMessage = styled.div`
  background-color: #f0f7ff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;

  p {
    font-size: 14px;
    color: var(--text-primary);
    line-height: 1.5;

    strong {
      color: var(--accent-color);
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
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--card-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const RecommendDesc = styled.p`
  font-size: 11px;
  color: var(--text-muted);
`;

const QuestionSection = styled.div`
  margin-top: 24px;
`;

const QuestionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

// 작성한 리뷰 탭 스타일
const ReviewItem = styled.div`
  margin-bottom: 24px;
`;

const ReviewNumber = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const ReviewPlaceName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const ReviewContent = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const ReviewImagePlaceholder = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
`;

// 샘플 데이터
const scheduleData = {
  tripTitle: "여수 여행",
  tripSubtitle: "바다와 함께하는 카페 투어",
  dates: ["11.12", "11.13", "11.14", "11.15"],
  places: [
    {
      id: 1,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      distance: "거리 예상시간",
      duration: "2시",
    },
    {
      id: 2,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      distance: "거리 예상시간",
      duration: "",
    },
    {
      id: 3,
      name: "여행지 이름",
      address: "주소가 들어갑니다. 주소가 들어갑니다.",
      distance: "거리 예상시간",
      duration: "",
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

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "recommend" | "review">("schedule");
  const [selectedDate, setSelectedDate] = useState(0);

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

            <DayLabel>
              <span>1일차</span>
              <button>편집</button>
            </DayLabel>

            <Timeline>
              {scheduleData.places.map((place) => (
                <TimelineItem key={place.id}>
                  <PlaceName>{place.name}</PlaceName>
                  <PlaceAddress>{place.address}</PlaceAddress>
                  <PlaceMeta>
                    <span>{place.distance}</span>
                    {place.duration && <span>{place.duration}</span>}
                  </PlaceMeta>
                  <WriteButton>지도 작성하기</WriteButton>
                </TimelineItem>
              ))}
            </Timeline>

            <AskButton>
              오늘 여행은 어디신가요?
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
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
