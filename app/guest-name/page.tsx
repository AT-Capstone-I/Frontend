'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
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
`;

const SubTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 18px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.108px;
  color: ${({ theme }) => theme.colors.greyscale1100};
  margin-bottom: 4px;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.144px;
  color: ${({ theme }) => theme.colors.greyscale1100};
  margin-bottom: 52px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2px;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ theme }) => theme.colors.greyscale1200};
`;

const RequiredMark = styled.span`
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.3px;
  color: #FD818B;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.greyscale200};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.greyscale000};
  font-family: ${({ theme }) => theme.typography.body};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.colors.greyscale1200};
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.greyscale400};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary500};
  }
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 18px;
  padding-bottom: max(34px, env(safe-area-inset-bottom));
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

export default function GuestNamePage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const isValid = name.trim().length > 0;

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    // 게스트 로그인이므로 이전 Google 로그인 임시 데이터 삭제
    localStorage.removeItem('temp_supabase_user_id');
    
    // 이름을 localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
    
    // 설문조사 페이지로 이동 (게스트 플래그 추가)
    router.push('/survey?guest=true');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit();
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

      <Content>
        <SubTitle>여행을 시작하기 전에,</SubTitle>
        <Title>먼저 이름부터 확인할게요.</Title>

        <InputWrapper>
          <LabelWrapper>
            <Label htmlFor="name">이름</Label>
            <RequiredMark>*</RequiredMark>
          </LabelWrapper>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            maxLength={20}
          />
        </InputWrapper>
      </Content>

      <BottomBar>
        <SubmitButton 
          $isActive={isValid} 
          onClick={handleSubmit}
          disabled={!isValid}
        >
          다음
        </SubmitButton>
      </BottomBar>
    </Container>
  );
}
