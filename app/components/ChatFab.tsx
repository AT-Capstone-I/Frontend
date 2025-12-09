"use client";

import { useRouter, usePathname } from "next/navigation";
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
  <svg viewBox="15 15 30 30" fill="currentColor">
    <path d="M21.25 30.8327V24.166H18.75C18.087 24.166 17.4511 24.4294 16.9822 24.8982C16.5134 25.3671 16.25 26.003 16.25 26.666V41.666C16.2512 41.8208 16.2956 41.9721 16.378 42.1031C16.4604 42.2341 16.5777 42.3396 16.7167 42.4077C16.8506 42.4686 16.9982 42.4929 17.1446 42.4783C17.2909 42.4637 17.4308 42.4106 17.55 42.3244L21.8417 39.166H33.0417C33.3575 39.1754 33.6719 39.1197 33.9654 39.0026C34.2589 38.8855 34.5252 38.7094 34.7478 38.4852C34.9705 38.261 35.1447 37.9935 35.2598 37.6992C35.3748 37.4049 35.4282 37.0901 35.4167 36.7743V35.8327H26.25C24.9239 35.8327 23.6521 35.3059 22.7145 34.3682C21.7768 33.4305 21.25 32.1588 21.25 30.8327Z" />
    <path d="M40.4167 18.334H26.25C25.587 18.334 24.9511 18.5974 24.4822 19.0662C24.0134 19.5351 23.75 20.1709 23.75 20.834V30.834C23.75 31.497 24.0134 32.1329 24.4822 32.6018C24.9511 33.0706 25.587 33.334 26.25 33.334H37.5417L41.525 36.4257C41.6434 36.5132 41.7829 36.5678 41.9293 36.5839C42.0757 36.6 42.2237 36.577 42.3583 36.5173C42.5001 36.4498 42.62 36.3435 42.704 36.2108C42.7881 36.0781 42.8329 35.9244 42.8333 35.7673V20.834C42.8337 20.1851 42.5818 19.5616 42.1308 19.095C41.6798 18.6285 41.0652 18.3556 40.4167 18.334Z" />
  </svg>
);

export default function ChatFab() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    router.push("/chat?reset=1");
  };

  // travel 상세 페이지, place 상세 페이지에서는 숨기기
  if (pathname?.startsWith('/travel/') || pathname?.startsWith('/place/')) {
    return null;
  }

  return (
    <FabButton aria-label="채팅" onClick={handleClick}>
      <ChatIcon />
    </FabButton>
  );
}
