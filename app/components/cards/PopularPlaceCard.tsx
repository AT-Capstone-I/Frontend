"use client";

import Link from "next/link";
import styled from "styled-components";

// Figma Design: 인기 장소 카드
const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 160px;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-4px);
  }

  @media (min-width: 768px) {
    width: 200px;
  }

  @media (min-width: 1024px) {
    width: 240px;
  }
`;

const CardImageWrapper = styled.div`
  width: 100%;
  height: 212px;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-500);

  @media (min-width: 768px) {
    height: 260px;
  }

  @media (min-width: 1024px) {
    height: 300px;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 41px;
  justify-content: center;
`;

const CardTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const CardDesc = styled.p`
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

interface PopularPlaceCardProps {
  id?: string | number;
  title: string;
  description: string;
  image: string;
}

export default function PopularPlaceCard({ id = "1", title, description, image }: PopularPlaceCardProps) {
  return (
    <Card href={`/place/${id}`}>
      <CardImageWrapper>
        <CardImage src={image} alt={title} />
      </CardImageWrapper>
      <CardInfo>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{description}</CardDesc>
      </CardInfo>
    </Card>
  );
}
