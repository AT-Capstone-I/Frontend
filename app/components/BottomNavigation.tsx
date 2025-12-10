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
    width: 24px;
    height: 24px;
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

// 아이콘 컴포넌트들 (Figma 디자인 시스템 기반)

// 홈 아이콘 (선택: after, 미선택: before)
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 19.895V10.2906C4 10.0077 4.06552 9.73996 4.19657 9.48729C4.32762 9.23462 4.50819 9.02652 4.73829 8.86298L10.8926 4.35691C11.2149 4.11897 11.5829 4 11.9966 4C12.4103 4 12.7806 4.11897 13.1074 4.35691L19.2617 8.86188C19.4926 9.02541 19.6731 9.23389 19.8034 9.48729C19.9345 9.73996 20 10.0077 20 10.2906V19.895C20 20.1912 19.8861 20.4494 19.6583 20.6696C19.4305 20.8899 19.1634 21 18.8571 21H14.9897C14.7276 21 14.5082 20.9145 14.3314 20.7436C14.1547 20.572 14.0663 20.3599 14.0663 20.1072V14.8376C14.0663 14.5849 13.9779 14.3731 13.8011 14.2022C13.6236 14.0306 13.4042 13.9448 13.1429 13.9448H10.8571C10.5958 13.9448 10.3768 14.0306 10.2 14.2022C10.0225 14.3731 9.93371 14.5849 9.93371 14.8376V20.1083C9.93371 20.361 9.84533 20.5727 9.66857 20.7436C9.49181 20.9145 9.27276 21 9.01143 21H5.14286C4.83657 21 4.56952 20.8899 4.34171 20.6696C4.1139 20.4494 4 20.1912 4 19.895Z" />
  </svg>
);

// 오늘일정 아이콘 (선택: after, 미선택: before)
const ScheduleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.3743 3.4873C9.83703 3.4873 7.78125 5.54309 7.78125 8.0804C7.78125 11.2183 9.67299 13.9117 12.3743 15.0944C15.0757 13.9117 16.9674 11.2183 16.9674 8.0804C16.9674 5.54309 14.9117 3.4873 12.3743 3.4873ZM12.3743 9.75255C11.451 9.75255 10.7022 9.00379 10.7022 8.0804C10.7022 7.15702 11.451 6.40826 12.3743 6.40826C13.2977 6.40826 14.0465 7.15702 14.0465 8.0804C14.0465 9.00379 13.2977 9.75255 12.3743 9.75255Z" />
    <path d="M20.022 16.3887L15.1484 21.2622H20.6781C20.903 21.2622 21.1147 21.1537 21.2443 20.9712C21.3766 20.7886 21.411 20.5532 21.3396 20.3415L20.022 16.3887Z" />
    <path d="M15.9484 18.9657L19.6472 15.2669L18.9196 13.0814C18.8244 12.7957 18.5572 12.6025 18.2555 12.6025H16.8056C15.787 14.3382 14.2366 15.7246 12.3792 16.5368C10.5219 15.7246 8.97144 14.3382 7.95281 12.6025H6.50027C6.19865 12.6025 5.93142 12.7957 5.83617 13.0814L4.82812 16.1056L15.9484 18.9657Z" />
    <path d="M6.11487 17.5313L4.48771 17.1133L3.41087 20.3438C3.33943 20.5581 3.37648 20.7909 3.50612 20.9735C3.63841 21.1561 3.84743 21.2645 4.07232 21.2645H6.11223V17.5313H6.11487Z" />
    <path d="M7.17188 17.8037V21.2618H13.6488L15.0749 19.8357L7.17188 17.8037Z" />
  </svg>
);

// 여행노트 아이콘 (선택: after, 미선택: before)
const NoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 6.5C4 6.10218 4.15804 5.72064 4.43934 5.43934C4.72064 5.15804 5.10218 5 5.5 5H17.5C17.8978 5 18.2794 5.15804 18.5607 5.43934C18.842 5.72064 19 6.10218 19 6.5V14H13.5C13.3674 14 13.2402 14.0527 13.1464 14.1464C13.0527 14.2402 13 14.3674 13 14.5V20H5.5C5.10218 20 4.72064 19.842 4.43934 19.5607C4.15804 19.2794 4 18.8978 4 18.5V6.5ZM16 9H7V8H16V9Z" />
    <path d="M14 20H14.086C14.4837 19.9997 14.865 19.8414 15.146 19.56L18.561 16.146C18.842 15.8648 18.9999 15.4835 19 15.086V15H14V20Z" />
  </svg>
);

// 마이페이지 아이콘 (선택: after, 미선택: before)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12C10.9 12 9.95833 11.6083 9.175 10.825C8.39167 10.0417 8 9.1 8 8C8 6.9 8.39167 5.95833 9.175 5.175C9.95833 4.39167 10.9 4 12 4C13.1 4 14.0417 4.39167 14.825 5.175C15.6083 5.95833 16 6.9 16 8C16 9.1 15.6083 10.0417 14.825 10.825C14.0417 11.6083 13.1 12 12 12ZM4 20V17.2C4 16.6333 4.146 16.1127 4.438 15.638C4.73 15.1633 5.11733 14.8007 5.6 14.55C6.63333 14.0333 7.68333 13.646 8.75 13.388C9.81667 13.13 10.9 13.0007 12 13C13.1 12.9993 14.1833 13.1287 15.25 13.388C16.3167 13.6473 17.3667 14.0347 18.4 14.55C18.8833 14.8 19.271 15.1627 19.563 15.638C19.855 16.1133 20.0007 16.634 20 17.2V20H4Z" />
  </svg>
);

const navItems = [
  { href: "/", icon: HomeIcon, label: "홈" },
  { href: "/schedule", icon: ScheduleIcon, label: "오늘일정" },
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
            <Icon />
            <span>{item.label}</span>
          </NavItem>
        );
      })}
    </NavWrapper>
  );
}
