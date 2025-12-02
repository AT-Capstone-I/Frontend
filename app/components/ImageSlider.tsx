"use client";

import { useState } from "react";
import styled from "styled-components";

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
`;

const SliderTrack = styled.div<{ $currentIndex: number }>`
  display: flex;
  transition: transform 0.3s ease;
  transform: translateX(${({ $currentIndex }) => -$currentIndex * 100}%);
`;

const SlideImage = styled.img`
  width: 100%;
  flex-shrink: 0;
  aspect-ratio: 4/3;
  object-fit: cover;
`;

const DotsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--border-color)")};
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

interface ImageSliderProps {
  images: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div>
      <SliderWrapper>
        <SliderTrack $currentIndex={currentIndex}>
          {images.map((image, index) => (
            <SlideImage key={index} src={image} alt={`이미지 ${index + 1}`} />
          ))}
        </SliderTrack>
      </SliderWrapper>
      {images.length > 1 && (
        <DotsWrapper>
          {images.map((_, index) => (
            <Dot
              key={index}
              $active={currentIndex === index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번째 이미지`}
            />
          ))}
        </DotsWrapper>
      )}
    </div>
  );
}

