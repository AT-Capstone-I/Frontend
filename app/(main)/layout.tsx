"use client";

import { usePathname } from "next/navigation";
import styled from "styled-components";
import { BottomNavigation, ChatFab } from "@/app/components";

const AppContainer = styled.div`
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  height: 100vh;
  background-color: var(--background);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  @media (min-width: 768px) {
    max-width: 100%;
  }
`;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 상세 페이지들에서는 ChatFab, BottomNavigation 숨기기
  const isPlaceDetailPage = pathname?.includes('/place/');
  const isTravelDetailPage = pathname?.includes('/travel/');
  const hideNavigation = isPlaceDetailPage || isTravelDetailPage;

  return (
    <AppContainer>
      {children}
      {!hideNavigation && <ChatFab />}
      {!hideNavigation && <BottomNavigation />}
    </AppContainer>
  );
}
