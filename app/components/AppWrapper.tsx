'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';

interface AppWrapperProps {
  children: React.ReactNode;
}

const SPLASH_STORAGE_KEY = 'moodtrip_splash_shown';
const SIGNUP_COMPLETED_KEY = 'moodtrip_signup_completed';

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 세션 내에서 이미 스플래시를 본 경우 바로 건너뛰기
    const hasSeenSplash = sessionStorage.getItem(SPLASH_STORAGE_KEY);
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
    setShowSplash(false);
    
    // 회원가입 여부 확인 후 리다이렉트
    const isSignupCompleted = localStorage.getItem(SIGNUP_COMPLETED_KEY);
    if (!isSignupCompleted && pathname !== '/signup') {
      router.push('/signup');
    }
  };

  // 서버 사이드에서는 children만 렌더링
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen 
          onFinish={handleSplashFinish} 
          duration={2000} 
        />
      )}
      {children}
    </>
  );
};

export default AppWrapper;

