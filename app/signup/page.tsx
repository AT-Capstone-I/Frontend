'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  display: flex;
  flex-direction: column;
`;

const LogoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 16px;
`;

const AppDescription = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.096px;
  color: ${({ theme }) => theme.colors.greyscale700};
  text-align: center;
`;

const BottomSection = styled.div`
  padding: 20px;
  padding-bottom: max(34px, env(safe-area-inset-bottom));
`;

const LoginSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GoogleLoginButton = styled.button`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.greyscale300};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: ${({ theme }) => theme.colors.greyscale1100};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.greyscale100};
    border-color: ${({ theme }) => theme.colors.greyscale400};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.8055 10.2275C19.8055 9.51805 19.7499 8.8364 19.6388 8.18253H10.2V12.0519H15.6011C15.3677 13.2994 14.6461 14.3594 13.5861 15.0686V17.577H16.8233C18.7122 15.8358 19.8055 13.2716 19.8055 10.2275Z" fill="#4285F4"/>
    <path d="M10.2 20C12.9 20 15.1711 19.1044 16.8233 17.577L13.5861 15.0686C12.6905 15.6686 11.5461 16.0219 10.2 16.0219C7.59497 16.0219 5.38275 14.2633 4.58941 11.9H1.26331V14.4908C2.90775 17.7575 6.29165 20 10.2 20Z" fill="#34A853"/>
    <path d="M4.58942 11.9C4.38942 11.3 4.27831 10.6592 4.27831 10C4.27831 9.34083 4.38942 8.7 4.58942 8.1V5.50916H1.26331C0.583313 6.85916 0.200012 8.38666 0.200012 10C0.200012 11.6133 0.583313 13.1408 1.26331 14.4908L4.58942 11.9Z" fill="#FBBC04"/>
    <path d="M10.2 3.97833C11.6744 3.97833 12.9961 4.48166 14.0283 5.47249L16.8955 2.60527C15.1677 0.990833 12.8966 0 10.2 0C6.29165 0 2.90775 2.2425 1.26331 5.50916L4.58941 8.1C5.38275 5.73666 7.59497 3.97833 10.2 3.97833Z" fill="#EA4335"/>
  </svg>
);

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.greyscale300};
`;

const DividerText = styled.span`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.greyscale600};
`;

const GuestButton = styled.button`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.greyscale200};
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: ${({ theme }) => theme.colors.greyscale800};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.greyscale300};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TermsText = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.greyscale600};
  text-align: center;
  margin-top: 24px;

  a {
    color: ${({ theme }) => theme.colors.greyscale800};
    text-decoration: underline;
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 페이지 진입 시 기존 세션 정리 (삭제된 사용자 대응)
  useEffect(() => {
    const clearOldSession = async () => {
      const hasError = searchParams.get('error');
      
      // 에러가 있거나 첫 진입 시 기존 세션 정리
      if (hasError) {
        console.log('🧹 이전 세션 정리 중...');
        await supabase.auth.signOut();
        // 관련 localStorage 정리
        localStorage.removeItem('temp_supabase_user_id');
      }
    };
    
    clearOldSession();
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('로그인 에러:', error.message);
        alert('로그인에 실패했습니다.');
        setIsLoading(false);
      }
      // 성공 시 자동으로 Google 로그인 페이지로 리다이렉트됨
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // 게스트 로그인 - 이름 입력 페이지로 이동
    router.push('/guest-name');
  };

  return (
    <Container>
      <LogoSection>
        <LogoWrapper>
          <Image
            src="/assets/icons/icon.svg"
            alt="MoodTrip"
            width={180}
            height={36}
            priority
          />
        </LogoWrapper>
        <AppDescription>나만을 위한 여행 추천 서비스</AppDescription>
      </LogoSection>

      <BottomSection>
        <LoginSection>
          <GoogleLoginButton onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? (
              '로그인 중...'
            ) : (
              <>
                <GoogleIcon />
                Google로 계속하기
              </>
            )}
          </GoogleLoginButton>

          <Divider>
            <DividerLine />
            <DividerText>또는</DividerText>
            <DividerLine />
          </Divider>

          <GuestButton onClick={handleGuestLogin}>
            게스트로 시작하기
          </GuestButton>
        </LoginSection>

        <TermsText>
          계속 진행하면 <a href="#">서비스 이용약관</a> 및 <a href="#">개인정보 처리방침</a>에 동의하는 것으로 간주됩니다.
        </TermsText>
      </BottomSection>
    </Container>
  );
}
