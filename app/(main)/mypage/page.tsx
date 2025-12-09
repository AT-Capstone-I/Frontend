"use client";

import styled, { keyframes } from "styled-components";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components";
import { logout, getUserName, getUserId } from "@/app/lib/api";
import { useState, useEffect } from "react";

// ============ Animations ============
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// ============ Styled Components ============
const MainContent = styled.main`
  padding-bottom: 100px;
  background: linear-gradient(180deg, var(--greyscale-100) 0%, var(--greyscale-200) 100%);
  min-height: 100vh;
`;

// 프로필 헤더 배경
const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40px 20px 80px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 50%);
    animation: ${float} 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -50%;
    left: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
    animation: ${float} 8s ease-in-out infinite reverse;
  }

  @media (min-width: 768px) {
    padding: 48px 40px 90px;
  }
`;

const ProfileContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const AvatarWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: 4px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(99, 102, 241, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 
      0 12px 40px rgba(99, 102, 241, 0.5),
      0 6px 20px rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 48px;
    height: 48px;
    color: var(--greyscale-000);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  @media (min-width: 768px) {
    width: 120px;
    height: 120px;

    svg {
      width: 56px;
      height: 56px;
    }
  }
`;

const AvatarBadge = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: 3px solid var(--greyscale-000);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.4);

  svg {
    width: 14px;
    height: 14px;
    color: var(--greyscale-000);
  }
`;

const ProfileName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const ProfileStatus = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  letter-spacing: -0.042px;
  margin-bottom: 20px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const EditProfileButton = styled.button`
  padding: 12px 32px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 통계 카드 컨테이너
const StatsContainer = styled.div`
  padding: 0 16px;
  margin-top: -50px;
  position: relative;
  z-index: 2;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;

  @media (min-width: 768px) {
    padding: 0 32px;
  }
`;

const StatsCard = styled.div`
  background: var(--greyscale-000);
  border-radius: 24px;
  padding: 24px 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);

  @media (min-width: 768px) {
    padding: 32px 40px;
    border-radius: 28px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: var(--greyscale-100);
    transform: translateY(-2px);
  }
`;

const StatIconWrapper = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ $color }) => `linear-gradient(135deg, ${$color}20 0%, ${$color}10 100%)`};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ $color }) => $color};
  }
`;

const StatValue = styled.span`
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 30px;
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--greyscale-600);
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

// 퀵 액션 버튼
const QuickActionsContainer = styled.div`
  padding: 20px 16px;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;

  @media (min-width: 768px) {
    padding: 24px 32px;
  }
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const QuickActionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--greyscale-000);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const QuickActionIcon = styled.div<{ $gradient: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ $gradient }) => $gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  ${QuickActionItem}:hover & {
    animation: ${pulse} 0.6s ease-in-out;
  }

  svg {
    width: 24px;
    height: 24px;
    color: var(--greyscale-000);
  }
`;

const QuickActionLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--greyscale-700);
  line-height: 1.3;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

// 메뉴 섹션
const MenuContainer = styled.div`
  padding: 0 16px;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;

  @media (min-width: 768px) {
    padding: 0 32px;
  }
`;

const MenuSection = styled.section`
  background: var(--greyscale-000);
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: var(--greyscale-500);
  padding: 20px 20px 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;

  @media (min-width: 768px) {
    padding: 24px 24px 16px;
  }
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 0;
    height: 1px;
    background: var(--greyscale-200);
  }

  &:last-child::after {
    display: none;
  }

  &:hover {
    background: linear-gradient(90deg, var(--greyscale-100) 0%, transparent 100%);
  }

  &:active {
    background: var(--greyscale-100);
  }

  @media (min-width: 768px) {
    padding: 16px 24px;
  }
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const MenuIcon = styled.div<{ $gradient?: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, var(--greyscale-400) 0%, var(--greyscale-300) 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  ${MenuItem}:hover & {
    transform: scale(1.05);
  }

  svg {
    width: 20px;
    height: 20px;
    color: var(--greyscale-000);
  }
`;

const MenuItemText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const MenuItemTitle = styled.span<{ $danger?: boolean }>`
  font-size: 15px;
  font-weight: 500;
  color: ${({ $danger }) => $danger ? '#E53935' : 'var(--greyscale-900)'};
  line-height: 1.4;
`;

const MenuItemSubtitle = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-500);
  line-height: 1.4;
`;

const ChevronIcon = styled.div`
  color: var(--greyscale-400);
  transition: transform 0.2s ease;

  ${MenuItem}:hover & {
    transform: translateX(4px);
    color: var(--greyscale-600);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// 앱 정보
const AppInfoSection = styled.div`
  padding: 32px 20px;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;
`;

const AppLogo = styled.div`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
`;

const AppVersion = styled.div`
  font-size: 12px;
  color: var(--greyscale-500);
  margin-bottom: 12px;
`;

const AppCopyright = styled.div`
  font-size: 11px;
  color: var(--greyscale-400);
`;

// ============ 아이콘 컴포넌트들 ============
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CompassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// ============ 메인 컴포넌트 ============
export default function MyPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("여행자");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const name = getUserName();
    const id = getUserId();
    if (name) setUserName(name);
    if (id) setUserId(id);
  }, []);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/');
      window.location.reload();
    }
  };

  const handleMenuClick = (action: string) => {
    console.log(`Menu clicked: ${action}`);
    alert(`'${action}' 기능은 준비 중입니다.`);
  };

  return (
    <>
      <Header showLogout={false} />
      <MainContent>
        {/* 프로필 헤더 */}
        <ProfileHeader>
          <ProfileContent>
            <AvatarWrapper>
              <Avatar>
                <UserIcon />
              </Avatar>
              <AvatarBadge>
                <StarIcon />
              </AvatarBadge>
            </AvatarWrapper>
            <ProfileName>{userName}님</ProfileName>
            <ProfileStatus>나만의 특별한 여행을 만들어보세요 ✨</ProfileStatus>
            <EditProfileButton onClick={() => handleMenuClick('프로필 편집')}>
              프로필 편집
            </EditProfileButton>
          </ProfileContent>
        </ProfileHeader>

        {/* 여행 통계 카드 */}
        <StatsContainer>
          <StatsCard>
            <StatItem onClick={() => handleMenuClick('방문한 장소')}>
              <StatIconWrapper $color="var(--primary-500)">
                <MapPinIcon />
              </StatIconWrapper>
              <StatValue>0</StatValue>
              <StatLabel>방문한 장소</StatLabel>
            </StatItem>
            <StatItem onClick={() => handleMenuClick('여행 노트')}>
              <StatIconWrapper $color="#FF9500">
                <EditIcon />
              </StatIconWrapper>
              <StatValue>0</StatValue>
              <StatLabel>여행 노트</StatLabel>
            </StatItem>
            <StatItem onClick={() => handleMenuClick('저장한 장소')}>
              <StatIconWrapper $color="#E91E63">
                <BookmarkIcon />
              </StatIconWrapper>
              <StatValue>0</StatValue>
              <StatLabel>저장한 장소</StatLabel>
            </StatItem>
          </StatsCard>
        </StatsContainer>

        {/* 퀵 액션 */}
        <QuickActionsContainer>
          <QuickActionsGrid>
            <QuickActionItem onClick={() => handleMenuClick('여행 스타일')}>
              <QuickActionIcon $gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)">
                <HeartIcon />
              </QuickActionIcon>
              <QuickActionLabel>여행 스타일</QuickActionLabel>
            </QuickActionItem>
            <QuickActionItem onClick={() => handleMenuClick('여행 탐색')}>
              <QuickActionIcon $gradient="linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%)">
                <CompassIcon />
              </QuickActionIcon>
              <QuickActionLabel>여행 탐색</QuickActionLabel>
            </QuickActionItem>
            <QuickActionItem onClick={() => handleMenuClick('사진 앨범')}>
              <QuickActionIcon $gradient="linear-gradient(135deg, #A855F7 0%, #C084FC 100%)">
                <CameraIcon />
              </QuickActionIcon>
              <QuickActionLabel>사진 앨범</QuickActionLabel>
            </QuickActionItem>
            <QuickActionItem onClick={() => handleMenuClick('알림')}>
              <QuickActionIcon $gradient="linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)">
                <BellIcon />
              </QuickActionIcon>
              <QuickActionLabel>알림</QuickActionLabel>
            </QuickActionItem>
          </QuickActionsGrid>
        </QuickActionsContainer>

        {/* 메뉴 섹션 */}
        <MenuContainer>
          {/* 계정 설정 */}
          <MenuSection>
            <SectionTitle>계정</SectionTitle>
            <MenuItem onClick={() => handleMenuClick('계정 설정')}>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #6366F1 0%, #818CF8 100%)">
                  <SettingsIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle>계정 설정</MenuItemTitle>
                  <MenuItemSubtitle>비밀번호 변경, 연동 계정 관리</MenuItemSubtitle>
                </MenuItemText>
              </MenuItemLeft>
              <ChevronIcon>
                <ChevronRight />
              </ChevronIcon>
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick('알림 설정')}>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)">
                  <BellIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle>알림 설정</MenuItemTitle>
                  <MenuItemSubtitle>푸시 알림 및 이메일 설정</MenuItemSubtitle>
                </MenuItemText>
              </MenuItemLeft>
              <ChevronIcon>
                <ChevronRight />
              </ChevronIcon>
            </MenuItem>
          </MenuSection>

          {/* 지원 */}
          <MenuSection>
            <SectionTitle>지원</SectionTitle>
            <MenuItem onClick={() => handleMenuClick('고객센터')}>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)">
                  <HelpCircleIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle>고객센터</MenuItemTitle>
                  <MenuItemSubtitle>FAQ 및 문의하기</MenuItemSubtitle>
                </MenuItemText>
              </MenuItemLeft>
              <ChevronIcon>
                <ChevronRight />
              </ChevronIcon>
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick('이용약관')}>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)">
                  <FileTextIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle>이용약관</MenuItemTitle>
                </MenuItemText>
              </MenuItemLeft>
              <ChevronIcon>
                <ChevronRight />
              </ChevronIcon>
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick('개인정보처리방침')}>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)">
                  <ShieldIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle>개인정보처리방침</MenuItemTitle>
                </MenuItemText>
              </MenuItemLeft>
              <ChevronIcon>
                <ChevronRight />
              </ChevronIcon>
            </MenuItem>
          </MenuSection>

          {/* 로그아웃 */}
          <MenuSection>
            <MenuItem onClick={handleLogout} $danger>
              <MenuItemLeft>
                <MenuIcon $gradient="linear-gradient(135deg, #EF4444 0%, #F87171 100%)">
                  <LogOutIcon />
                </MenuIcon>
                <MenuItemText>
                  <MenuItemTitle $danger>로그아웃</MenuItemTitle>
                </MenuItemText>
              </MenuItemLeft>
            </MenuItem>
          </MenuSection>
        </MenuContainer>

        {/* 앱 정보 */}
        <AppInfoSection>
          <AppLogo>MoodTrip</AppLogo>
          <AppVersion>Version 1.0.0</AppVersion>
          <AppCopyright>© 2025 MoodTrip. All rights reserved.</AppCopyright>
        </AppInfoSection>
      </MainContent>
    </>
  );
}
