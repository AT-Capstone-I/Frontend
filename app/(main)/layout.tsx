"use client";

import { usePathname } from "next/navigation";
import styled from "styled-components";
import { BottomNavigation, ChatFab } from "@/app/components";

const AppContainer = styled.div`
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background-color: var(--background);
  position: relative;
  overflow-x: hidden;

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
  
  // 노트 상세 페이지에서는 ChatFab, BottomNavigation 숨기기
  const isNoteDetailPage = pathname?.startsWith('/notes/') && pathname !== '/notes';

  return (
    <AppContainer>
      {children}
      {!isNoteDetailPage && <ChatFab />}
      {!isNoteDetailPage && <BottomNavigation />}
    </AppContainer>
  );
}
