"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

// Types
interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  isLoading?: boolean;
  places?: Place[];
  showMoreButton?: boolean;
}

interface Place {
  id: number;
  name: string;
  address: string;
  image: string;
}

// Styled Components - Figma Design System 적용
const ChatContainer = styled.div`
  height: 100vh;
  height: 100dvh;
  background-color: var(--primary-050, #F2F8FF);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  background-color: var(--primary-050, #F2F8FF);
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--greyscale-1100, #111112);
  width: 24px;
  height: 24px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeaderTitle = styled.h1`
  font-family: 'Gmarket Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1100, #111112);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const HeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DateBadge = styled.div`
  align-self: center;
  background-color: var(--greyscale-300, #E1E1E4);
  color: var(--greyscale-800, #5E5B61);
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  margin-bottom: 4px;
`;

const MessageWrapper = styled.div<{ $isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  margin-left: ${({ $isUser }) => ($isUser ? "31px" : "0")};
  max-width: 100%;
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  display: inline-block;
  max-width: calc(100% - 40px);
  width: fit-content;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.045px;
  background-color: ${({ $isUser }) =>
    $isUser ? "var(--primary-100, #E0F0FF)" : "var(--greyscale-000, #FFFFFF)"};
  color: var(--greyscale-1200, #111111);
  word-break: keep-all;
  word-wrap: break-word;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--greyscale-900, #444246);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  padding: 4px 0;

  svg {
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const CompletedMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-500, #4F9DE8);
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  padding: 4px 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AIResponseCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  background-color: var(--greyscale-000, #FFFFFF);
  border-radius: 12px;
  overflow: hidden;
`;

const AIResponseMessage = styled.div`
  padding: 8px 16px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.045px;
  color: var(--greyscale-1200, #111111);
`;

const PlaceCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 14px;
  width: 100%;
`;

const PlaceCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const PlaceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const PlaceImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--greyscale-200, #F1F1F1);
`;

const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 41px;
  justify-content: center;
  flex: 1;
  min-width: 0;
`;

const PlaceName = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2B2A2C);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaceAddress = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-700, #77747B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  color: var(--greyscale-600, #918E94);
  transform: rotate(0deg);
  transition: transform 0.2s ease;

  &:hover {
    color: var(--greyscale-900, #444246);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 12px 20px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background-color: var(--greyscale-000, #FFFFFF);
  border-top: 1px solid var(--greyscale-300, #E1E1E4);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--greyscale-200, #F2F1F2);
  border-radius: 20px;
  padding: 10px 16px;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--greyscale-1100, #111112);
  outline: none;

  &::placeholder {
    color: var(--greyscale-600, #918E94);
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--primary-500, #4F9DE8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:disabled {
    color: var(--greyscale-400, #C4C2C6);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    color: var(--primary-400, #66B2FE);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const LoadingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// 하드코딩된 장소 데이터
const mockPlaces: Place[] = [
  {
    id: 1,
    name: "죠죠 더현대서울점",
    address: "서울 영등포구 여의대로 108 지하1층",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "고우가 여의도점",
    address: "서울 영등포구 여의대로 24 FKI타워...",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "화해당 여의도점",
    address: "서울 영등포구 국회대로62길 15 광...",
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=100&h=100&fit=crop",
  },
];

// 여행 테마 데이터
const mockTravelThemes: Place[] = [
  {
    id: 1,
    name: "여수",
    address: "조용한 아침에 스며드는 여유",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "서울",
    address: "설렘으로 가득한 여의도의 밤",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "제주",
    address: "따뜻한 한상, 집밥처럼 편안한 한식집",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=100&fit=crop",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "장소 추천을 받으시거나, 여행을 계획하고 싶으시다면 편하게 말씀해주세요!",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // 장소 추천 요청인지 여행 계획 요청인지 판단
    const isPlaceRequest = inputValue.includes("장소") || inputValue.includes("음식점") || inputValue.includes("카페") || inputValue.includes("맛집");
    const isTravelRequest = inputValue.includes("여행") || inputValue.includes("여수") || inputValue.includes("제주") || inputValue.includes("부산");

    // 로딩 메시지 추가
    setTimeout(() => {
      const loadingMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: isPlaceRequest ? "장소를 검색하는 중입니다." : "여행 테마를 생성하는 중입니다.",
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMessage]);
    }, 500);

    // AI 응답
    setTimeout(() => {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLoading);
        
        if (isTravelRequest) {
          return [
            ...filtered,
            {
              id: Date.now() + 2,
              type: "ai",
              content: "생성 완료했습니다!",
              isLoading: false,
            },
            {
              id: Date.now() + 3,
              type: "ai",
              content: "태훈 님의 요청에 맞춰서 여행 테마를 만들어봤어요. 원하시는 테마를 고르시거나, 변경하고 싶다면 말씀해주세요.",
              places: mockTravelThemes,
              showMoreButton: true,
            },
          ];
        } else {
          return [
            ...filtered,
            {
              id: Date.now() + 2,
              type: "ai",
              content: "영등포 주변의 음식점을 찾아보았어요. 원하시는 장소를 고르시거나, 변경하고 싶다면 말씀해주세요.",
              places: mockPlaces,
              showMoreButton: true,
            },
          ];
        }
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, "0")}. ${String(today.getDate()).padStart(2, "0")}`;
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <BackButton onClick={() => router.back()}>
          <BackIcon />
        </BackButton>
        <HeaderTitle>MoodTrip</HeaderTitle>
        <HeaderSpacer />
      </ChatHeader>

      <ChatContent>
        <DateBadge>{getTodayDate()}</DateBadge>

        {messages.map((message) => (
          <MessageWrapper key={message.id} $isUser={message.type === "user"}>
            {message.isLoading ? (
              <LoadingMessage>
                <LoadingIcon />
                {message.content}
              </LoadingMessage>
            ) : message.type === "ai" && message.content === "생성 완료했습니다!" ? (
              <CompletedMessage>
                <CheckIcon />
                {message.content}
              </CompletedMessage>
            ) : message.places ? (
              <AIResponseCard>
                <AIResponseMessage>{message.content}</AIResponseMessage>
                <PlaceCardContainer>
                  <PlaceCardList>
                    {message.places.map((place) => (
                      <PlaceCard key={place.id} onClick={() => router.push(`/place/${place.id}`)}>
                        <PlaceImage src={place.image} alt={place.name} />
                        <PlaceInfo>
                          <PlaceName>{place.name}</PlaceName>
                          <PlaceAddress>{place.address}</PlaceAddress>
                        </PlaceInfo>
                      </PlaceCard>
                    ))}
                  </PlaceCardList>
                  {message.showMoreButton && (
                    <MoreButton>
                      <ChevronDownIcon />
                    </MoreButton>
                  )}
                </PlaceCardContainer>
              </AIResponseCard>
            ) : (
              <MessageBubble $isUser={message.type === "user"}>
                {message.content}
              </MessageBubble>
            )}
          </MessageWrapper>
        ))}
      </ChatContent>

      <InputContainer>
        <InputWrapper>
          <TextInput
            type="text"
            placeholder="오늘 점심 시간에 갈 만한 음식점 추천해주세요."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
          />
          <SendButton onClick={handleSendMessage} disabled={!inputValue.trim() || isProcessing}>
            <SendIcon />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
}

