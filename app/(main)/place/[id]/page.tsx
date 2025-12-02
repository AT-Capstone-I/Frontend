"use client";

import { useParams } from "next/navigation";
import styled from "styled-components";
import { BackButton, ImageSlider } from "@/app/components";

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 100px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  position: sticky;
  top: 0;
  background-color: var(--background);
  z-index: 10;
`;

const LikeButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #ff6b6b;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Content = styled.div`
  padding: 0 20px;
`;

const PlaceTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const PlaceAddress = styled.p`
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;

  svg {
    width: 16px;
    height: 16px;
    color: #ffc107;
  }

  span {
    font-size: 14px;
    color: var(--text-secondary);
  }
`;

const ImageSection = styled.div`
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 24px;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const ReferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReferenceItem = styled.a`
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);

  &:hover {
    color: var(--accent-color);
  }
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 12px;
`;

const MapButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

// 하드코딩된 샘플 데이터
const placeData = {
  id: "1",
  name: "성심당 본점",
  address: "대전 중구 대종로 480번길 15",
  rating: 4.2,
  images: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=450&fit=crop",
    "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=450&fit=crop",
  ],
  description:
    "대전을 대표한 성심당 본점은 1956년에 문을 연 모던 전통의 베이커리로, 튀김소보로와 부추빵 같은 시그니처 메뉴로 사랑받는 곳입니다. 본점은 대전 중구 대종로에 위치해 있으며, 현지인은 물론 여행자들도 꼭 들르는 명소로 꼽힙니다.",
  references: [
    { title: "대전 성심당 본점 : 인생 베이커리 VLOG", url: "#" },
    { title: "11월 닷. 추천메뉴, 딸기시루 먹방 및 후기 - 성심당 투어...", url: "#" },
    { title: "대전 시내 빵지순례 3탄 / 주말 웨이팅 / 영업시간 / 위치...", url: "#" },
  ],
};

export default function PlaceDetailPage() {
  const params = useParams();

  return (
    <PageWrapper>
      <Header>
        <BackButton />
        <LikeButton aria-label="좋아요">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </LikeButton>
      </Header>

      <Content>
        <PlaceTitle>{placeData.name}</PlaceTitle>
        <PlaceAddress>{placeData.address}</PlaceAddress>

        <RatingWrapper>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} viewBox="0 0 24 24" fill={star <= Math.floor(placeData.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
          <span>{placeData.rating}</span>
        </RatingWrapper>

        <ImageSection>
          <ImageSlider images={placeData.images} />
        </ImageSection>

        <Description>{placeData.description}</Description>

        <Section>
          <SectionTitle>참고자료</SectionTitle>
          <ReferenceList>
            {placeData.references.map((ref, index) => (
              <ReferenceItem key={index} href={ref.url}>
                {ref.title}
              </ReferenceItem>
            ))}
          </ReferenceList>
        </Section>

        <Section>
          <SectionTitle>여행 지역</SectionTitle>
          <MapPlaceholder>지도 영역</MapPlaceholder>
          <MapButton>네이버 지도 확인하기</MapButton>
        </Section>
      </Content>
    </PageWrapper>
  );
}

