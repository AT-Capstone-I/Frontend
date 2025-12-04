'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Image from 'next/image';

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

const SplashContainer = styled.div<{ $isExiting: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${({ $isExiting }) => $isExiting ? fadeOut : 'none'} 0.5s ease-out forwards;
`;

const LogoWrapper = styled.div`
  animation: ${fadeIn} 0.8s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const LogoImage = styled(Image)`
  width: 200px;
  height: auto;
`;

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish, 
  duration = 2000 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, duration + 500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onFinish]);

  if (!isVisible) return null;

  return (
    <SplashContainer $isExiting={isExiting}>
      <LogoWrapper>
        <LogoImage 
          src="/assets/icons/icon.svg" 
          alt="MoodTrip"
          width={200}
          height={40}
          priority
        />
      </LogoWrapper>
    </SplashContainer>
  );
};

export default SplashScreen;

