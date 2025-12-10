"use client";

import styled from "styled-components";

const FooterWrapper = styled.footer`
  background-color: var(--greyscale-100);
  padding: 24px 20px 100px;
  border-top: 1px solid var(--greyscale-200);

  @media (min-width: 768px) {
    padding: 32px 40px 110px;
  }

  @media (min-width: 1024px) {
    padding: 40px 60px 120px;
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
`;

const FooterLink = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--greyscale-700);
  text-decoration: none;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FooterText = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-500);
  line-height: 1.5;
  letter-spacing: -0.036px;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

const Copyright = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-400);
  margin-top: 8px;
  letter-spacing: -0.036px;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <FooterContent>
        <FooterLinks>
          <FooterLink>이용약관</FooterLink>
          <FooterLink>개인정보처리방침</FooterLink>
          <FooterLink>고객센터</FooterLink>
          <FooterLink>서비스 소개</FooterLink>
        </FooterLinks>
        <FooterInfo>
          <FooterText>
            MoodTrip | 대표: TEAM Wave
          </FooterText>
          <FooterText>
            이메일: contact@moodtrip.com
          </FooterText>
        </FooterInfo>
        <Copyright>
          © {currentYear} MoodTrip. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterWrapper>
  );
}
