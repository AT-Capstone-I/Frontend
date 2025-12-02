"use client";

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
  return (
    <AppContainer>
      {children}
      <ChatFab />
      <BottomNavigation />
    </AppContainer>
  );
}
