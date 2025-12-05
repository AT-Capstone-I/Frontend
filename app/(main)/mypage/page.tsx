"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components";
import { logout, getUserName, getUserId } from "@/app/lib/api";
import { useState, useEffect } from "react";

// ============ Styled Components ============
const MainContent = styled.main`
  padding-bottom: 100px;
  background-color: var(--greyscale-200);
  min-height: 100vh;
`;

// 프로필 섹션
const ProfileSection = styled.section`
  background-color: var(--greyscale-000);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    padding: 32px 40px;
  }
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-400) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 36px;
    height: 36px;
    color: var(--greyscale-000);
  }

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;

    svg {
      width: 40px;
      height: 40px;
    }
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--greyscale-1100);
  line-height: 1.4;
  letter-spacing: -0.12px;
  margin-bottom: 4px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const ProfileStatus = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: var(--greyscale-600);
  line-height: 1.4;
  letter-spacing: -0.042px;
`;

const EditProfileButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--greyscale-300);
  background-color: var(--greyscale-000);
  font-size: 13px;
  font-weight: 500;
  color: var(--greyscale-800);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: var(--greyscale-100);
    border-color: var(--greyscale-400);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// 여행 통계 섹션
const StatsSection = styled.section`
  background-color: var(--greyscale-000);
  padding: 20px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    padding: 24px 40px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-500);
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-600);
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

// 메뉴 섹션
const MenuSection = styled.section`
  background-color: var(--greyscale-000);
  margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 500;
  color: var(--greyscale-600);
  padding: 16px 20px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    padding: 20px 40px 12px;
  }
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--greyscale-100);
  }

  &:active {
    background-color: var(--greyscale-200);
  }

  @media (min-width: 768px) {
    padding: 18px 40px;
  }
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${({ $color }) => $color || 'var(--greyscale-200)'};
  display: flex;
  align-items: center;
  justify-content: center;

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
  color: ${({ $danger }) => $danger ? '#E53935' : 'var(--greyscale-1100)'};
  line-height: 1.4;
`;

const MenuItemSubtitle = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-600);
  line-height: 1.4;
`;

const ChevronIcon = styled.div`
  color: var(--greyscale-400);

  svg {
    width: 20px;
    height: 20px;
  }
`;

// 앱 버전
const AppVersion = styled.div`
  text-align: center;
  padding: 24px 20px;
  font-size: 12px;
  color: var(--greyscale-500);
`;

// ============ 아이콘 컴포넌트들 ============
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
    // TODO: 각 메뉴 액션 구현
    console.log(`Menu clicked: ${action}`);
    alert(`'${action}' 기능은 준비 중입니다.`);
  };

  return (
    <>
      <Header showLogout={false} />
      <MainContent>
        {/* 프로필 섹션 */}
        <ProfileSection>
          <Avatar>
            <UserIcon />
          </Avatar>
          <ProfileInfo>
            <ProfileName>{userName}님</ProfileName>
            <ProfileStatus>나만의 특별한 여행을 만들어보세요</ProfileStatus>
          </ProfileInfo>
          <EditProfileButton onClick={() => handleMenuClick('프로필 편집')}>
            편집
          </EditProfileButton>
        </ProfileSection>

        {/* 여행 통계 섹션 */}
        <StatsSection>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>방문한 장소</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>여행 노트</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>저장한 장소</StatLabel>
          </StatItem>
        </StatsSection>

        {/* 여행 설정 */}
        <MenuSection>
          <SectionTitle>여행 설정</SectionTitle>
          <MenuItem onClick={() => handleMenuClick('선호 여행 스타일')}>
            <MenuItemLeft>
              <MenuIcon $color="var(--primary-500)">
                <HeartIcon />
              </MenuIcon>
              <MenuItemText>
                <MenuItemTitle>선호 여행 스타일</MenuItemTitle>
                <MenuItemSubtitle>맞춤 추천을 위한 취향 설정</MenuItemSubtitle>
              </MenuItemText>
            </MenuItemLeft>
            <ChevronIcon>
              <ChevronRight />
            </ChevronIcon>
          </MenuItem>
          <MenuItem onClick={() => handleMenuClick('저장한 장소')}>
            <MenuItemLeft>
              <MenuIcon $color="#FF9500">
                <MapPinIcon />
              </MenuIcon>
              <MenuItemText>
                <MenuItemTitle>저장한 장소</MenuItemTitle>
                <MenuItemSubtitle>북마크한 여행지 관리</MenuItemSubtitle>
              </MenuItemText>
            </MenuItemLeft>
            <ChevronIcon>
              <ChevronRight />
            </ChevronIcon>
          </MenuItem>
          <MenuItem onClick={() => handleMenuClick('알림 설정')}>
            <MenuItemLeft>
              <MenuIcon $color="#34C759">
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

        {/* 계정 설정 */}
        <MenuSection>
          <SectionTitle>계정</SectionTitle>
          <MenuItem onClick={() => handleMenuClick('계정 설정')}>
            <MenuItemLeft>
              <MenuIcon $color="var(--greyscale-700)">
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
        </MenuSection>

        {/* 지원 */}
        <MenuSection>
          <SectionTitle>지원</SectionTitle>
          <MenuItem onClick={() => handleMenuClick('고객센터')}>
            <MenuItemLeft>
              <MenuIcon $color="#5856D6">
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
              <MenuIcon $color="#007AFF">
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
              <MenuIcon $color="#32ADE6">
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
              <MenuIcon $color="#E53935">
                <LogOutIcon />
              </MenuIcon>
              <MenuItemText>
                <MenuItemTitle $danger>로그아웃</MenuItemTitle>
              </MenuItemText>
            </MenuItemLeft>
          </MenuItem>
        </MenuSection>

        {/* 앱 버전 */}
        <AppVersion>
          MoodTrip v1.0.0
        </AppVersion>
      </MainContent>
    </>
  );
}
