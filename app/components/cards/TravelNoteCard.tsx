"use client";

import { useRouter } from "next/navigation";
import styled, { keyframes, css } from "styled-components";

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

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

const CardImageWrapper = styled.div<{ $isLoading?: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--greyscale-200, #e8e7e9);
  
  ${({ $isLoading }) => $isLoading && css`
    background: linear-gradient(
      90deg,
      var(--greyscale-200, #e8e7e9) 25%,
      var(--greyscale-100, #f7f7f7) 50%,
      var(--greyscale-200, #e8e7e9) 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
  `}
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
  tripId?: string;
  title: string;
  image: string;
}

export default function TravelNoteCard({ tripId, title, image }: TravelNoteCardProps) {
  const router = useRouter();
  const isLoading = !image;

  const handleClick = () => {
    if (tripId) {
      // trip_id가 있으면 계획 페이지(여행노트 상세)로 이동
      router.push(`/notes/${tripId}`);
    }
  };

  return (
    <Card onClick={handleClick}>
      <CardImageWrapper $isLoading={isLoading}>
        {image && <CardImage src={image} alt={title} />}
      </CardImageWrapper>
      <CardTitle>{title}</CardTitle>
    </Card>
  );
}
