"use client";

import styled from "styled-components";

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
  return <AppContainer>{children}</AppContainer>;
}

