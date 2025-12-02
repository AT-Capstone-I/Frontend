"use client";

import Link from "next/link";
import styled from "styled-components";

const Card = styled(Link)`
  display: block;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--card-background);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;

  @media (min-width: 768px) {
    height: 200px;
  }
`;

const CardInfo = styled.div`
  padding: 12px;
`;

const CardTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const CardDesc = styled.p`
  font-size: 12px;
  color: var(--text-muted);
`;

interface PlaceCardProps {
  id?: string | number;
  title: string;
  description: string;
  image: string;
}

export default function PlaceCard({ id = "1", title, description, image }: PlaceCardProps) {
  return (
    <Card href={`/place/${id}`}>
      <CardImage src={image} alt={title} />
      <CardInfo>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{description}</CardDesc>
      </CardInfo>
    </Card>
  );
}
