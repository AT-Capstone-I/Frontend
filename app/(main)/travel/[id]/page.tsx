"use client";

import { useParams } from "next/navigation";
import styled from "styled-components";
import { BackButton } from "@/app/components";

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 100px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  position: sticky;
  top: 0;
  background-color: var(--background);
  z-index: 10;
`;

const Content = styled.div`
  padding: 0 20px;
`;

const TravelTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const TravelSubtitle = styled.p`
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 24px;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  margin-bottom: 20px;
`;

const DetailTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const DetailContent = styled.div`
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
`;

const Tag = styled.span<{ $type: "good" | "recommend" | "tip" }>`
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 6px;
  margin-bottom: 4px;
  background-color: ${({ $type }) => {
    switch ($type) {
      case "good":
        return "#e8f5e9";
      case "recommend":
        return "#e3f2fd";
      case "tip":
        return "#fff3e0";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case "good":
        return "#2e7d32";
      case "recommend":
        return "#1565c0";
      case "tip":
        return "#ef6c00";
      default:
        return "#666";
    }
  }};
`;

const TaggedText = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;

  svg {
    width: 20px;
    height: 20px;
    margin-left: 4px;
  }
`;

const LastMessage = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const LastMessageTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const LastMessageContent = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
`;

const ReferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReferenceItem = styled.a`
  font-size: 13px;
  color: var(--accent-color);
  text-decoration: underline;
  padding: 4px 0;

  &:hover {
    opacity: 0.8;
  }
`;

const BottomButton = styled.button`
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 390px;
  padding: 16px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  z-index: 50;

  &:hover {
    opacity: 0.9;
  }

  @media (min-width: 768px) {
    max-width: 100%;
    width: calc(100% - 80px);
  }
`;

// 하드코딩된 샘플 데이터
const travelData = {
  id: "1",
  title: "여수",
  subtitle: "하루의 피로를 풀어주는 느긋한 아침",
  image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&h=500&fit=crop",
  description:
    "아침은 하루를 결정짓는 작은 의식입니다. 바다 내음이 섞인 여수의 여유로운 공기 속에서 천천히 깨어나는 시간은, 일상의 피로를 말끔히 풀어줄 특별한 치유가 됩니다.",
  details: [
    {
      title: "1. 대각게장",
      subtitle: "신선한 게의 단맛이 입안에 녹아드는 아침 한상",
      items: [
        { type: "good" as const, text: "분위기: 창문으로 들어오는 햇살과 함께 집에서 걸어 모락모락 풍미와는 한판 갈아 오기" },
        { type: "recommend" as const, text: "추천 포인트: 여수의 바다를 바로 느낄 수 있는 재료로 만든 게장으로 아침부터 든든한 만족감을 줍니다" },
        { type: "tip" as const, text: "에디터 팁: 밥은 조금 적게 주문하고 반찬을 골고루 맛보세요. 테이블 회전이 빠르니 여유 있게 방문을 추천합니다" },
      ],
    },
    {
      title: "2. 상야식당",
      subtitle: "해산물의 다채로운 맛을 한상으로 즐기는 곳",
      items: [
        { type: "good" as const, text: "분위기: 소박한 항구 식당의 소리와 함께 걸어서서 바다 힐이 뭍기는 핑기" },
        { type: "recommend" as const, text: "추천 포인트: 다양한 해산물 매뉴로 여러 가지 맛을 조금씩 즐기기 좋아 아침 여행 식사로 안성맞춤입니다" },
        { type: "tip" as const, text: "에디터 팁: 인기 메뉴는 금세 소진되니 일찍 가서 주문하세요, 반면 테이블 온용은 부담 없이 하세요" },
      ],
    },
    {
      title: "3. 청청게장은",
      subtitle: "깔끔한 재료 본연의 맛으로 시작하는 하루",
      items: [
        { type: "good" as const, text: "분위기: 정갈한 플레이팅과 비타 좋음이 어우러져 아끔까지 차분해지는 느낌" },
        { type: "recommend" as const, text: "추천 포인트: 신선한 해산물 본연의 맛을 살려 부담 없이 즐길 수 있어 아침 식사로 부담이 적습니다" },
        { type: "tip" as const, text: "에디터 팁: 주차 공간이 제한적일 수 있으니 가급적 대중교통을 이용하거나 일찍 도착하세요" },
      ],
    },
  ],
  lastMessage:
    "여수의 느긋한 아침은 소리와 향, 맛이 어우러져 하루의 피로를 잊게 합니다. 한 상으로 채우는 작은 사치가 여행의 기억을 오래도록 남겨줄 거예요.",
  references: [
    { title: "대전 성심당 본점 : 인생 베이커리 VLOG", url: "#" },
    { title: "11월 닷. 추천메뉴, 딸기시루 먹방 및 후기 - 성심당 투어...", url: "#" },
    { title: "대전 시내 빵지순례 3탄 / 주말 웨이팅 / 영업시간 / 위치...", url: "#" },
  ],
};

export default function TravelDetailPage() {
  const params = useParams();

  return (
    <PageWrapper>
      <Header>
        <BackButton />
      </Header>

      <Content>
        <TravelTitle>{travelData.title}</TravelTitle>
        <TravelSubtitle>{travelData.subtitle}</TravelSubtitle>

        <MainImage src={travelData.image} alt={travelData.title} />

        <Description>{travelData.description}</Description>

        <Section>
          <SectionTitle>상세 설명</SectionTitle>
          {travelData.details.map((detail, index) => (
            <DetailItem key={index}>
              <DetailTitle>{detail.title}</DetailTitle>
              <DetailContent>
                <p style={{ marginBottom: "8px", color: "var(--text-primary)", fontSize: "13px" }}>
                  {detail.subtitle}
                </p>
                {detail.items.map((item, itemIndex) => (
                  <TaggedText key={itemIndex}>
                    <Tag $type={item.type}>
                      {item.type === "good" && "분위기"}
                      {item.type === "recommend" && "추천 포인트"}
                      {item.type === "tip" && "에디터 팁"}
                    </Tag>
                    {item.text.split(": ")[1]}
                  </TaggedText>
                ))}
              </DetailContent>
            </DetailItem>
          ))}
        </Section>

        <LastMessage>
          <LastMessageTitle>마지막 한마디</LastMessageTitle>
          <LastMessageContent>{travelData.lastMessage}</LastMessageContent>
        </LastMessage>

        <Section>
          <SectionTitle>참고자료</SectionTitle>
          <ReferenceList>
            {travelData.references.map((ref, index) => (
              <ReferenceItem key={index} href={ref.url}>
                {ref.title}
              </ReferenceItem>
            ))}
          </ReferenceList>
        </Section>
      </Content>

      <BottomButton>여기로 결정하기</BottomButton>
    </PageWrapper>
  );
}

