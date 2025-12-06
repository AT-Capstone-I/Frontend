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
    
    // [디버깅] 회원가입 체크 임시 비활성화 - 나중에 원복 필요!
    // const isSignupCompleted = localStorage.getItem(SIGNUP_COMPLETED_KEY);
    // if (!isSignupCompleted && pathname !== '/signup') {
    //   router.push('/signup');
    // }
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

