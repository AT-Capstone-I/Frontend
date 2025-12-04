"use client";

import styled from "styled-components";

// Figma Design: Tab Navigation
const TabNav = styled.nav`
  display: flex;
  align-items: center;
  height: 41px;
  padding: 0 20px;
  background-color: var(--greyscale-000);
  border-bottom: 1px solid var(--greyscale-300);
  gap: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ $active }) => ($active ? "var(--greyscale-1200)" : "var(--greyscale-600)")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--primary-500);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: var(--greyscale-1200);
  }
`;

interface TabNavigationProps {
  activeTab: "place" | "travel";
  onTabChange: (tab: "place" | "travel") => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <TabNav>
      <TabButton $active={activeTab === "place"} onClick={() => onTabChange("place")}>
        장소
      </TabButton>
      <TabButton $active={activeTab === "travel"} onClick={() => onTabChange("travel")}>
        여행
      </TabButton>
    </TabNav>
  );
}
