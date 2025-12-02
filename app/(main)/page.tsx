"use client";

import { useState } from "react";
import styled from "styled-components";
import {
  Header,
  TabNavigation,
  PlaceCard,
  TravelCard,
  TravelNoteCard,
  PopularPlaceCard,
} from "@/app/components";

// Styled Components
const MainContent = styled.main`
  padding-bottom: 80px;
  background-color: var(--background);
`;

const RecommendationMessage = styled.div`
  padding: 20px 20px 24px;
  background-color: var(--primary-color);

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    margin-bottom: 4px;
  }

  h2 {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
  }

  @media (min-width: 768px) {
    padding: 28px 40px 32px;

    p {
      font-size: 15px;
    }

    h2 {
      font-size: 24px;
    }
  }

  @media (min-width: 1024px) {
    padding: 36px 60px 40px;

    p {
      font-size: 17px;
    }

    h2 {
      font-size: 30px;
    }
  }
`;

const Section = styled.section`
  padding: 16px 20px;

  @media (min-width: 768px) {
    padding: 20px 40px;
  }

  @media (min-width: 1024px) {
    padding: 28px 60px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);

  @media (min-width: 768px) {
    font-size: 17px;
  }

  @media (min-width: 1024px) {
    font-size: 19px;
  }
`;

const SectionMore = styled.button`
  font-size: 12px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;

  @media (min-width: 1024px) {
    font-size: 13px;
  }
`;

const PlaceCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
  }
`;

const HorizontalScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    gap: 16px;
  }
`;

// 하드코딩된 샘플 데이터
const placeRecommendations = [
  {
    id: 1,
    title: "장소 이름",
    description: "주소가 들어갑니다.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "장소 이름",
    description: "주소가 들어갑니다.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "장소 이름",
    description: "주소가 들어갑니다.",
    image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "장소 이름",
    description: "주소가 들어갑니다.",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop",
  },
];

const popularPlaces = [
  {
    id: 1,
    title: "인기 장소",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    title: "인기 장소",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    title: "인기 장소",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=300&h=200&fit=crop",
  },
];

const travelNotes = [
  {
    id: 1,
    title: "여수",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    title: "제주도",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    title: "서울",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    title: "대전",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=200&h=200&fit=crop",
  },
];

const travelRecommendations = [
  {
    id: 1,
    title: "여수",
    description: "바다와 함께하는 카페 투어",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "전주",
    description: "고즈넉한 한옥 마을의 향기",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "부산",
    description: "해운대의 멋진 일몰",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=300&fit=crop",
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"place" | "travel">("place");

  return (
    <>
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <MainContent>
        {activeTab === "place" ? (
          <>
            <RecommendationMessage>
              <p>비가 내리는 점심 시간이네요.</p>
              <h2>이런 장소는 어떨까요?</h2>
            </RecommendationMessage>

            <Section>
              <SectionHeader>
                <SectionTitle>장소 추천</SectionTitle>
                <SectionMore>추천 받기</SectionMore>
              </SectionHeader>
              <PlaceCardGrid>
                {placeRecommendations.map((place) => (
                  <PlaceCard
                    key={place.id}
                    title={place.title}
                    description={place.description}
                    image={place.image}
                  />
                ))}
              </PlaceCardGrid>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>인기 장소</SectionTitle>
                <SectionMore>추천 받기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {popularPlaces.map((place) => (
                  <PopularPlaceCard
                    key={place.id}
                    title={place.title}
                    image={place.image}
                  />
                ))}
              </HorizontalScroll>
            </Section>
          </>
        ) : (
          <>
            <RecommendationMessage>
              <p>어디론가 훌쩍 떠나고 싶다면,</p>
              <h2>나만을 위한 특별한 여행을 만나볼까요?</h2>
            </RecommendationMessage>

            <Section>
              <SectionHeader>
                <SectionTitle>작성 중인 여행 노트</SectionTitle>
                <SectionMore>전체 보기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {travelNotes.map((note) => (
                  <TravelNoteCard
                    key={note.id}
                    title={note.title}
                    image={note.image}
                  />
                ))}
              </HorizontalScroll>
            </Section>

            <Section>
              <SectionHeader>
                <SectionTitle>여행 추천</SectionTitle>
                <SectionMore>추천 받기</SectionMore>
              </SectionHeader>
              <HorizontalScroll>
                {travelRecommendations.map((travel) => (
                  <TravelCard
                    key={travel.id}
                    title={travel.title}
                    description={travel.description}
                    image={travel.image}
                  />
                ))}
              </HorizontalScroll>
            </Section>
          </>
        )}
      </MainContent>
    </>
  );
}
