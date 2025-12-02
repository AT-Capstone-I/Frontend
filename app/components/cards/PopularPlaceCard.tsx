"use client";

import styled from "styled-components";

const Card = styled.div`
  flex-shrink: 0;
  width: 130px;
  cursor: pointer;

  &:hover img {
    transform: scale(1.05);
  }

  @media (min-width: 768px) {
    width: 150px;
  }

  @media (min-width: 1024px) {
    width: 180px;
  }
`;

const CardImage = styled.img`
  width: 130px;
  height: 90px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 8px;
  transition: transform 0.2s ease;

  @media (min-width: 768px) {
    width: 150px;
    height: 100px;
  }

  @media (min-width: 1024px) {
    width: 180px;
    height: 120px;
    border-radius: 12px;
  }
`;

const CardTitle = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

interface PopularPlaceCardProps {
  title: string;
  image: string;
}

export default function PopularPlaceCard({ title, image }: PopularPlaceCardProps) {
  return (
    <Card>
      <CardImage src={image} alt={title} />
      <CardTitle>{title}</CardTitle>
    </Card>
  );
}
