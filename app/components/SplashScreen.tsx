'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Image from 'next/image';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const slideUpFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const backgroundTransition = keyframes`
  0% {
    background-color: #FFFFFF;
  }
  100% {
    background-color: #66B2FE;
  }
`;

const SplashContainer = styled.div<{ $isExiting: boolean; $isLoaded: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ $isLoaded }) => $isLoaded ? '#66B2FE' : '#FFFFFF'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  ${({ $isLoaded }) => $isLoaded && css`
    animation: ${backgroundTransition} 0.8s ease-out forwards;
  `}
  
  ${({ $isExiting }) => $isExiting && css`
    animation: ${fadeOut} 0.5s ease-out forwards;
  `}
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LogoWrapper = styled.div<{ $isLoaded: boolean }>`
  animation: ${fadeIn} 0.8s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* 로딩 완료 시 로고 색상 반전 (흰색으로) */
  ${({ $isLoaded }) => $isLoaded && css`
    filter: brightness(0) invert(1);
    transition: filter 0.5s ease-out;
  `}
`;

const LogoImage = styled(Image)`
  width: 200px;
  height: auto;
`;

const TaglineText = styled.p<{ $isVisible: boolean }>`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: #FFFFFF;
  text-align: center;
  opacity: 0;
  
  ${({ $isVisible }) => $isVisible && css`
    animation: ${slideUpFadeIn} 0.6s ease-out 0.3s forwards;
  `}
`;

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  duration = 2000 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1단계: 로딩 완료 (배경색 변경 + 텍스트 표시)
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, duration * 0.4); // 전체 시간의 40%에서 로딩 완료

    // 2단계: 종료 애니메이션 시작
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    // 3단계: 완전히 숨김
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, duration + 500);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <SplashContainer $isExiting={isExiting} $isLoaded={isLoaded}>
      <ContentWrapper>
        <LogoWrapper $isLoaded={isLoaded}>
          <LogoImage 
            src="/assets/icons/icon.svg" 
            alt="MoodTrip"
            width={200}
            height={40}
            priority
          />
        </LogoWrapper>
        <TaglineText $isVisible={isLoaded}>
          당신 취향 그대로, 맞춤 여행 시작!
        </TaglineText>
      </ContentWrapper>
    </SplashContainer>
  );
};

export default SplashScreen;
