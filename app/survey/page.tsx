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

// 5개 질문 데이터 (API 양식에 맞춤)
const SURVEY_QUESTIONS = [
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
    options: [
      { id: 0, text: '🫖 예쁜 카페에서 여유롭게' },
      { id: 1, text: '🎿 근처 체험/액티비티 찾아보기' },
      { id: 2, text: '🚶 동네 구석구석 걸어다니며 구경' },
      { id: 3, text: '🛍️ 쇼핑몰이나 시장 구경' },
    ],
  },
  {
    question_id: 4,
    title: '📸 여행 중 사진은?',
    options: [
      { id: 0, text: '📷 인생샷 스팟은 꼭 찾아가야지' },
      { id: 1, text: '👁️ 눈으로 보는 게 더 좋아, 가끔만' },
      { id: 2, text: '🍔 음식 사진이 제일 많음' },
    ],
  },
];

export default function SurveyPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(SURVEY_QUESTIONS.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // 이름 가져오기
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (savedName) {
      setUserName(savedName);
    } else {
      // 이름이 없으면 signup 페이지로 리다이렉트
      router.push('/signup');
    }
  }, [router]);

  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === SURVEY_QUESTIONS.length - 1;
  const isOptionSelected = currentAnswer !== null;

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  const handleOptionSelect = (optionId: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionId;
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

        const result = await submitOnboarding(userName, onboardingAnswers);
        
        // user_id 저장
        localStorage.setItem(STORAGE_KEYS.USER_ID, result.user_id);
        localStorage.setItem(STORAGE_KEYS.SIGNUP_COMPLETED, 'true');
        
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

        <OptionsList>
          {currentQuestion.options.map((option) => (
            <OptionButton
              key={option.id}
              $isSelected={currentAnswer === option.id}
              onClick={() => handleOptionSelect(option.id)}
            >
              <OptionText $isSelected={currentAnswer === option.id}>
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
