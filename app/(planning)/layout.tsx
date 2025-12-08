"use client";

import { usePathname } from "next/navigation";
import styled from "styled-components";
import { BottomNavigation } from "@/app/components";

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

export default function PlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // /notes/[id] 상세 페이지에서는 네비게이션 숨기기
  const isDetailPage = pathname?.match(/^\/notes\/[^/]+$/);

  return (
    <AppContainer>
      {children}
      {!isDetailPage && <BottomNavigation />}
    </AppContainer>
  );
}

