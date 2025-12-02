"use client";

import Link from "next/link";
import styled from "styled-components";

const Card = styled(Link)`
  display: block;
  flex-shrink: 0;
  width: 200px;
  border-radius: 14px;
  overflow: hidden;
  background-color: var(--card-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  @media (min-width: 768px) {
    width: 240px;
  }

  @media (min-width: 1024px) {
    width: 300px;
    border-radius: 16px;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;

  @media (min-width: 768px) {
    height: 170px;
  }

  @media (min-width: 1024px) {
    height: 190px;
  }
`;

const CardInfo = styled.div`
  padding: 12px;

  @media (min-width: 1024px) {
    padding: 16px;
  }
`;

const CardTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const CardDesc = styled.p`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 1024px) {
    font-size: 13px;
  }
`;

interface TravelCardProps {
  id?: string | number;
  title: string;
  description: string;
  image: string;
}

export default function TravelCard({ id = "1", title, description, image }: TravelCardProps) {
  return (
    <Card href={`/travel/${id}`}>
      <CardImage src={image} alt={title} />
      <CardInfo>
        <CardTitle>{title}</CardTitle>
        <CardDesc>{description}</CardDesc>
      </CardInfo>
    </Card>
  );
}
