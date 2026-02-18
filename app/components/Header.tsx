"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import { logout } from "@/app/lib/api";

// Figma Design: Top bar (헤더)
const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  background-color: var(--greyscale-000);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  height: 18px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--greyscale-700);
  transition: color 0.2s ease;

  &:hover {
    color: var(--greyscale-900);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      router.push('/');
      // 페이지 새로고침으로 스플래시부터 다시 시작
      window.location.reload();
    }
  };

  return (
    <HeaderWrapper>
      <LogoContainer>
        <img
          src="/assets/icons/icon.svg"
          alt="MoodTrip"
          width={94}
          height={18}
        />
      </LogoContainer>
      {showLogout && (
        <LogoutButton onClick={handleLogout} aria-label="로그아웃">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M16 17L21 12L16 7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M21 12H9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </LogoutButton>
      )}
    </HeaderWrapper>
  );
}
