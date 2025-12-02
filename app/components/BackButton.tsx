"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";

const Button = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);

  svg {
    width: 24px;
    height: 24px;
  }
`;

export default function BackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} aria-label="뒤로가기">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Button>
  );
}

