'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/navigation';
import { submitOnboarding, OnboardingAnswer, STORAGE_KEYS } from '@/app/lib/api';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

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

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  height: 50px;
`;

const BackButton = styled.button`
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const BackIcon = styled.svg`
  width: 8px;
  height: 16px;
`;

const Spacer = styled.div`
  width: 24px;
  height: 24px;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const QuestionNumber = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.042px;
  color: ${({ theme }) => theme.colors.primary500};
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.132px;
  color: ${({ theme }) => theme.colors.greyscale1100};
  margin-bottom: 28px;
`;

const MultiSelectHint = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary500};
  margin-top: -16px;
  margin-bottom: 12px;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionButton = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  min-height: 58px;
  padding: 16px 20px;
  border-radius: 12px;
  background-color: ${({ $isSelected }) => 
    $isSelected ? '#F2F8FF' : '#FFFFFF'};
  border: 1px solid ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.primary500 : theme.colors.greyscale300};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;

  &:hover {
    border-color: ${({ $isSelected, theme }) => 
      $isSelected ? theme.colors.primary500 : theme.colors.greyscale400};
  }
`;

const OptionText = styled.span<{ $isSelected: boolean }>`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.greyscale1200 : theme.colors.greyscale700};
`;

const PageIndicator = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ theme }) => theme.colors.greyscale400};
  text-align: center;
  margin-top: auto;
  margin-bottom: 20px;
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 18px 34px;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  box-shadow: 0px -3px 8px rgba(0, 0, 0, 0.06);
`;

const SubmitButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 12px;
  background-color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.greyscale900 : theme.colors.greyscale500};
  color: ${({ theme }) => theme.colors.greyscale000};
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: ${({ $isActive }) => ($isActive ? 'pointer' : 'not-allowed')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ $isActive, theme }) => 
      $isActive ? theme.colors.greyscale1000 : theme.colors.greyscale500};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// 질문 타입 정의
interface SurveyQuestion {
  question_id: number;
  title: string;
  multiSelect?: boolean;
  maxSelect?: number;
  options: { id: number; text: string }[];
}

type AnswerValue = number | number[] | null;

// 6개 질문 데이터 (API 양식에 맞춤)
const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    question_id: 0,
    title: '✈️ 드디어 여행 첫날 아침! 당신은?',
    options: [
      { id: 0, text: '⏰ 알람 맞춰 일찍 일어나 아침부터 움직인다' },
      { id: 1, text: '☕ 느긋하게 브런치 먹고 오후부터 슬슬' },
      { id: 2, text: '🎲 그날 컨디션 보고 결정!' },
    ],
  },
  {
    question_id: 1,
    title: '📍 여행지 도착! 첫 번째로 가고 싶은 곳은?',
    options: [
      { id: 0, text: '🏛️ 여기 오면 꼭 가야 한다는 유명 스팟' },
      { id: 1, text: '🚶 현지인들만 아는 숨은 골목' },
      { id: 2, text: '🏠 일단 숙소 근처 동네 산책' },
    ],
  },
  {
    question_id: 2,
    title: '🍜 점심시간! 어떻게 정할까?',
    options: [
      { id: 0, text: '📱 이미 저장해둔 맛집 리스트로 GO' },
      { id: 1, text: '👀 지나가다 분위기 좋으면 바로 입장' },
      { id: 2, text: '👥 줄 서 있는 곳 = 맛집이다' },
    ],
  },
  {
    question_id: 3,
    title: '☕ 오후 3시, 자유시간 2시간이 생겼다!',
    multiSelect: true,
    maxSelect: 2,
    options: [
      { id: 0, text: '🫖 예쁜 카페에서 여유롭게' },
      { id: 1, text: '🎿 근처 체험/액티비티 찾아보기' },
      { id: 2, text: '🚶 동네 구석구석 걸어다니며 구경' },
      { id: 3, text: '🛍️ 쇼핑몰이나 시장 구경' },
    ],
  },
  {
    question_id: 4,
    title: '🌿 여행에서 가장 끌리는 분위기는?',
    options: [
      { id: 0, text: '🏡 한적하고 여유로운 곳이 좋아요' },
      { id: 1, text: '✨ 감성적이고 특별한 곳이 좋아요' },
      { id: 2, text: '🎉 활기차고 북적이는 곳이 좋아요' },
      { id: 3, text: '🌳 자연 속에서 힐링하는 곳이 좋아요' },
    ],
  },
  {
    question_id: 5,
    title: '👥 주로 누구와 여행하세요?',
    options: [
      { id: 0, text: '👤 혼자서 자유롭게' },
      { id: 1, text: '👫 연인/배우자와 함께' },
      { id: 2, text: '👨‍👩‍👧‍👦 가족과 함께' },
      { id: 3, text: '👥 친구들과 함께' },
    ],
  },
];

export default function SurveyPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerValue[]>(
    new Array(SURVEY_QUESTIONS.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;
    
    // URL에서 파라미터 읽기 (useSearchParams 대신 직접 읽기)
    const urlParams = new URLSearchParams(window.location.search);
    const fromGoogle = urlParams.get('from_google');
    const isGuest = urlParams.get('guest');
    const urlUserId = urlParams.get('user_id');
    const urlUserName = urlParams.get('user_name');
    
    console.log('📋 URL 파라미터:', { fromGoogle, isGuest, urlUserId, urlUserName });
    
    // 1. URL 파라미터에서 Google 로그인 정보 확인
    if (fromGoogle === 'true' && urlUserId && urlUserName) {
      const decodedName = decodeURIComponent(urlUserName);
      console.log('✅ Google 로그인 사용자:', decodedName, urlUserId);
      setUserName(decodedName);
      setSupabaseUserId(urlUserId);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, decodedName);
      localStorage.setItem('temp_supabase_user_id', urlUserId);
      setIsLoading(false);
      return;
    }
    
    // 2. 게스트 로그인인 경우 - temp_supabase_user_id 사용하지 않음
    if (isGuest === 'true') {
      const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      console.log('👤 게스트 로그인:', savedName);
      // 게스트이므로 temp_supabase_user_id 확실히 삭제
      localStorage.removeItem('temp_supabase_user_id');
      setUserName(savedName || '여행자');
      setSupabaseUserId(null);  // 명시적으로 null 설정
      setIsLoading(false);
      return;
    }
    
    // 3. localStorage 확인 (Google 로그인 후 새로고침 등의 경우)
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    const tempUserId = localStorage.getItem('temp_supabase_user_id');
    
    console.log('📋 localStorage:', { savedName, tempUserId });
    
    if (savedName) {
      setUserName(savedName);
      // temp_supabase_user_id는 Google 로그인 플로우에서만 사용
      // (from_google 파라미터가 없지만 temp_supabase_user_id가 있는 경우는 
      //  Google 로그인 후 새로고침한 경우이므로 허용)
      if (tempUserId) {
        setSupabaseUserId(tempUserId);
      }
      setIsLoading(false);
      return;
    }
    
    // 4. 아무것도 없으면 기본값 사용 (리다이렉트 하지 않음)
    console.log('⚠️ 사용자 정보 없음, 기본값 사용');
    setUserName('여행자');
    setIsLoading(false);
  }, []);

  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === SURVEY_QUESTIONS.length - 1;
  const isOptionSelected = currentAnswer !== null &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  const handleOptionSelect = (optionId: number) => {
    const newAnswers = [...answers];
    const question = SURVEY_QUESTIONS[currentQuestionIndex];

    if (question.multiSelect) {
      const maxSelect = question.maxSelect ?? 2;
      const currentSelection = Array.isArray(newAnswers[currentQuestionIndex])
        ? (newAnswers[currentQuestionIndex] as number[])
        : [];

      if (currentSelection.includes(optionId)) {
        const updated = currentSelection.filter(id => id !== optionId);
        newAnswers[currentQuestionIndex] = updated.length > 0 ? updated : null;
      } else if (currentSelection.length < maxSelect) {
        newAnswers[currentQuestionIndex] = [...currentSelection, optionId];
      }
    } else {
      newAnswers[currentQuestionIndex] = optionId;
    }

    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!isOptionSelected) return;

    if (isLastQuestion) {
      // 모든 질문 완료 - API 호출
      setIsSubmitting(true);
      
      try {
        const onboardingAnswers: OnboardingAnswer[] = answers.map((answer, index) => ({
          question_id: index,
          selected_option: answer!,
        }));

        // Supabase user_id가 있으면 전달 (Google 로그인한 경우)
        const result = await submitOnboarding(userName, onboardingAnswers, supabaseUserId);
        
        // user_id 저장 (Supabase ID 또는 API에서 반환된 ID 사용)
        const finalUserId = supabaseUserId || result.user_id;
        localStorage.setItem(STORAGE_KEYS.USER_ID, finalUserId);
        localStorage.setItem(STORAGE_KEYS.SIGNUP_COMPLETED, 'true');
        
        // 임시 저장된 Supabase user_id 삭제
        localStorage.removeItem('temp_supabase_user_id');
        
        // 홈 화면으로 이동
        router.push('/');
      } catch (error) {
        console.error('온보딩 에러:', error);
        alert('온보딩 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 다음 질문으로
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <Container>
        <Content>
          <Title>로딩 중...</Title>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <TopBar>
        <BackButton onClick={handleBack}>
          <BackIcon viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M7 1L1 8L7 15" 
              stroke="#111111" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </BackIcon>
        </BackButton>
        <Spacer />
      </TopBar>

      <Content key={currentQuestionIndex}>
        <QuestionNumber>질문 {currentQuestionIndex + 1}/{SURVEY_QUESTIONS.length}</QuestionNumber>
        <Title>{currentQuestion.title}</Title>

        {currentQuestion.multiSelect && (
          <MultiSelectHint>최대 {currentQuestion.maxSelect ?? 2}개 선택</MultiSelectHint>
        )}

        <OptionsList>
          {currentQuestion.options.map((option) => (
            <OptionButton
              key={option.id}
              $isSelected={
                Array.isArray(currentAnswer)
                  ? currentAnswer.includes(option.id)
                  : currentAnswer === option.id
              }
              onClick={() => handleOptionSelect(option.id)}
            >
              <OptionText $isSelected={
                Array.isArray(currentAnswer)
                  ? currentAnswer.includes(option.id)
                  : currentAnswer === option.id
              }>
                {option.text}
              </OptionText>
            </OptionButton>
          ))}
        </OptionsList>

        <PageIndicator>
          {currentQuestionIndex + 1}/{SURVEY_QUESTIONS.length}
        </PageIndicator>
      </Content>

      <BottomBar>
        <SubmitButton 
          $isActive={isOptionSelected && !isSubmitting} 
          onClick={handleSubmit}
          disabled={!isOptionSelected || isSubmitting}
        >
          {isSubmitting ? '처리 중...' : isLastQuestion ? '완료' : '다음'}
        </SubmitButton>
      </BottomBar>
    </Container>
  );
}
