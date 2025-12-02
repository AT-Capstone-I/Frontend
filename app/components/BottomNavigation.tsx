"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background-color: var(--nav-background);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-around;
  padding: 8px 0 20px;
  z-index: 100;

  @media (max-width: 430px) {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }

  @media (min-width: 768px) {
    max-width: 100%;
    padding: 10px 0 24px;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--text-muted)")};
  transition: color 0.2s ease;
  text-decoration: none;

  svg {
    width: 22px;
    height: 22px;
  }

  span {
    font-size: 10px;
    font-weight: 500;
  }

  @media (min-width: 768px) {
    padding: 8px 20px;

    svg {
      width: 26px;
      height: 26px;
    }

    span {
      font-size: 11px;
    }
  }
`;

// 아이콘 컴포넌트들
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    {!active && <polyline points="9,22 9,12 15,12 15,22" />}
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill={active ? "currentColor" : "none"} />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const NoteIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems = [
  { href: "/", icon: HomeIcon, label: "홈" },
  { href: "/schedule", icon: CalendarIcon, label: "오늘일정" },
  { href: "/notes", icon: NoteIcon, label: "여행노트" },
  { href: "/mypage", icon: UserIcon, label: "마이페이지" },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <NavWrapper>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <NavItem key={item.href} href={item.href} $active={isActive}>
            <Icon active={isActive} />
            <span>{item.label}</span>
          </NavItem>
        );
      })}
    </NavWrapper>
  );
}
