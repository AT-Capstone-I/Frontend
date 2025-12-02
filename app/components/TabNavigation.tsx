"use client";

import styled from "styled-components";

const TabNav = styled.nav`
  display: flex;
  padding: 0 20px;
  background-color: var(--primary-color);
  gap: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 0;
  font-size: 14px;
  color: ${({ $active }) => ($active ? "#ffffff" : "rgba(255, 255, 255, 0.5)")};
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
    background-color: #ffffff;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
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
