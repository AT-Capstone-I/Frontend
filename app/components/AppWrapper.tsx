'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SplashScreen from './SplashScreen';

interface AppWrapperProps {
  children: React.ReactNode;
}

const SIGNUP_COMPLETED_KEY = 'moodtrip_signup_completed';

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 새로고침할 때마다 스플래시 표시
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    
    // 예외 페이지: signup, survey, auth 관련 페이지는 리다이렉트하지 않음
    const excludedPaths = ['/signup', '/survey', '/auth', '/onboarding-check', '/login'];
    const isExcludedPath = excludedPaths.some(path => pathname?.startsWith(path));
    
    // 회원가입 완료 여부 확인 후 미완료 시 signup 페이지로 리다이렉트
    const isSignupCompleted = localStorage.getItem(SIGNUP_COMPLETED_KEY);
    if (!isSignupCompleted && !isExcludedPath) {
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

