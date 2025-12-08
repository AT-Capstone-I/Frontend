'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { supabase } from '@/app/lib/supabase';
import { STORAGE_KEYS, checkUserOnboarded } from '@/app/lib/api';

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

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Auth callback 시작...');
        
        // URL에서 에러 확인
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth 에러:', error);
          // 에러 발생 시 기존 세션 정리 (삭제된 사용자 등 대응)
          await supabase.auth.signOut();
          localStorage.removeItem('temp_supabase_user_id');
          setStatus('로그인 실패 - 다시 시도해주세요');
          router.push('/signup?error=auth');
          return;
        }

        // 세션 확인 (implicit flow는 자동으로 세션 설정)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📋 세션:', session);
        
        if (sessionError) {
          console.error('세션 에러:', sessionError);
        }

        // 사용자 정보 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log('👤 사용자:', user);
        
        if (userError) {
          console.error('사용자 에러:', userError);
        }

        if (user) {
          // 사용자 정보 저장
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '여행자';
          localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
          localStorage.setItem('temp_supabase_user_id', user.id);
          
          console.log('✅ 로그인 성공:', userName);
          setStatus('온보딩 상태 확인 중...');
          
          // 1. localStorage 먼저 확인 (빠른 체크)
          const signupCompleted = localStorage.getItem(STORAGE_KEYS.SIGNUP_COMPLETED);
          const existingUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
          
          if (signupCompleted === 'true' && existingUserId) {
            console.log('✅ localStorage에서 기존 사용자 확인 → 홈으로 이동');
            router.push('/');
            return;
          }
          
          // 2. 백엔드 API로 온보딩 완료 여부 확인
          console.log('🔍 백엔드에서 온보딩 상태 확인 중...');
          const isOnboarded = await checkUserOnboarded(user.id);
          
          if (isOnboarded) {
            // 백엔드에 프로필 있음 → localStorage 복구 후 홈으로 이동
            console.log('✅ 백엔드에서 기존 사용자 확인 → 홈으로 이동');
            localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
            localStorage.setItem(STORAGE_KEYS.SIGNUP_COMPLETED, 'true');
            router.push('/');
          } else {
            // 신규 사용자 → 설문 페이지로 이동
            console.log('📝 신규 사용자 → 설문으로 이동');
            setStatus('설문 페이지로 이동 중...');
            router.push(`/survey?user_id=${user.id}&user_name=${encodeURIComponent(userName)}&from_google=true`);
          }
        } else {
          // 세션이 없으면 signup으로
          console.log('❌ 사용자 없음');
          setStatus('로그인 실패');
          router.push('/signup');
        }
      } catch (err) {
        console.error('Callback 에러:', err);
        setStatus('오류 발생');
        router.push('/signup?error=auth');
      }
    };

    // 약간의 딜레이 후 실행 (세션 설정 시간 확보)
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container>
      <LoadingSpinner />
      <LoadingText>{status}</LoadingText>
    </Container>
  );
}


