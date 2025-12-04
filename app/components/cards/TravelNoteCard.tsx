"use client";

import styled from "styled-components";

// Figma Design: 작성 중인 여행 노트 카드
const Card = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 74px;
  gap: 4px;
  align-items: flex-start;
  cursor: pointer;

  @media (min-width: 768px) {
    width: 90px;
  }

  @media (min-width: 1024px) {
    width: 100px;
  }
`;

const CardImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-200);
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const CardTitle = styled.p`
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-900);
  text-align: center;

  @media (min-width: 768px) {
    font-size: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

interface TravelNoteCardProps {
  title: string;
  image: string;
}

export default function TravelNoteCard({ title, image }: TravelNoteCardProps) {
  return (
    <Card>
      <CardImageWrapper>
        <CardImage src={image} alt={title} />
      </CardImageWrapper>
      <CardTitle>{title}</CardTitle>
    </Card>
  );
}
