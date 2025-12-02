"use client";

import styled from "styled-components";

const Card = styled.div`
  flex-shrink: 0;
  width: 85px;
  text-align: center;
  cursor: pointer;

  &:hover img {
    transform: scale(1.05);
  }

  @media (min-width: 768px) {
    width: 100px;
  }

  @media (min-width: 1024px) {
    width: 110px;
  }
`;

const CardImage = styled.img`
  width: 85px;
  height: 85px;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 8px;
  transition: transform 0.2s ease;

  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
  }

  @media (min-width: 1024px) {
    width: 110px;
    height: 110px;
  }
`;

const CardTitle = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);

  @media (min-width: 768px) {
    font-size: 13px;
  }

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

interface TravelNoteCardProps {
  title: string;
  image: string;
}

export default function TravelNoteCard({ title, image }: TravelNoteCardProps) {
  return (
    <Card>
      <CardImage src={image} alt={title} />
      <CardTitle>{title}</CardTitle>
    </Card>
  );
}
