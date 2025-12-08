'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { supabase } from '@/app/lib/supabase';
import { STORAGE_KEYS } from '@/app/lib/api';

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${({ theme }) => theme.colors.greyscale200};
  border-top-color: ${({ theme }) => theme.colors.primary500};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.greyscale700};
`;

export default function OnboardingCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        console.log('🔍 온보딩 체크 시작...');
        
        // 1. 현재 로그인된 사용자 정보 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('👤 사용자 정보:', user);
        console.log('❌ 사용자 에러:', userError);
        
        if (!user) {
          console.log('❌ 사용자 없음 → signup으로 이동');
          router.push('/signup');
          return;
        }

        // 사용자 정보를 localStorage에 저장
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '여행자';
        localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
        
        console.log('✅ 사용자 확인됨:', userName);

        // 온보딩 완료한 것으로 간주하고 바로 설문으로 이동
        // (user_data 테이블 체크는 백엔드에서 처리)
        const existingUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const signupCompleted = localStorage.getItem(STORAGE_KEYS.SIGNUP_COMPLETED);
        
        if (signupCompleted === 'true' && existingUserId) {
          // 이미 온보딩 완료 → 메인 화면
          console.log('✅ 기존 사용자 → 메인으로 이동');
          router.push('/');
        } else {
          // 온보딩 미완료 → 설문 화면
          console.log('📝 신규 사용자 → 설문으로 이동');
          // Supabase user.id를 임시 저장 (설문 완료 후 최종 저장)
          localStorage.setItem('temp_supabase_user_id', user.id);
          router.push('/survey');
        }
      } catch (error) {
        console.error('❌ 온보딩 체크 실패:', error);
        router.push('/signup');
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [router]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
        <LoadingText>로그인 확인 중...</LoadingText>
      </Container>
    );
  }

  return null;
}
