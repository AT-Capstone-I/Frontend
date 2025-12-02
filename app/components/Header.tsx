"use client";

import styled from "styled-components";

const HeaderWrapper = styled.header`
  padding: 16px 20px 8px;
  background-color: var(--primary-color);
`;

const Logo = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
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
