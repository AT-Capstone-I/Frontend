"use client";

import styled from "styled-components";
import { Header } from "@/app/components";

const MainContent = styled.main`
  padding-bottom: 80px;
  background-color: var(--background);
`;

const PagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
  text-align: center;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;

    @media (min-width: 1024px) {
      font-size: 32px;
    }
  }

  p {
    font-size: 14px;
    color: var(--text-muted);

    @media (min-width: 1024px) {
      font-size: 16px;
    }
  }
`;

export default function MyPage() {
  return (
    <>
      <Header />
      <MainContent>
        <PagePlaceholder>
          <h2>마이페이지</h2>
          <p>내 정보를 관리하세요</p>
        </PagePlaceholder>
      </MainContent>
    </>
  );
}
