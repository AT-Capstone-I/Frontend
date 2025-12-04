"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";

const FabButton = styled.button`
  position: fixed;
  bottom: 96px;
  right: calc(50% - 195px);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(74, 144, 217, 0.4);
  z-index: 99;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(74, 144, 217, 0.5);
  }

  svg {
    width: 24px;
    height: 24px;
    color: #ffffff;
  }

  @media (max-width: 430px) {
    right: 20px;
  }

  @media (min-width: 768px) {
    right: 40px;
    bottom: 110px;
    width: 60px;
    height: 60px;

    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function ChatFab() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/chat");
  };

  return (
    <FabButton aria-label="채팅" onClick={handleClick}>
      <ChatIcon />
    </FabButton>
  );
}
