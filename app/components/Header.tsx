"use client";

import styled from "styled-components";

// Figma Design: Top bar (헤더)
const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  background-color: var(--greyscale-000);
`;

const Logo = styled.h1`
  font-family: 'KOHIBaeum', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  color: var(--greyscale-1000);
  letter-spacing: 0;
`;

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "MoodTrip" }: HeaderProps) {
  return (
    <HeaderWrapper>
      <Logo>{title}</Logo>
    </HeaderWrapper>
  );
}
