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

// Styled Components
const ChatContainer = styled.div`
  height: 100vh;
  height: 100dvh;
  background-color: #f8fcff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.header`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DateBadge = styled.div`
  align-self: center;
  background-color: var(--text-muted);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 8px;
`;

const MessageWrapper = styled.div<{ $isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div<{ $isUser?: boolean }>`
  max-width: 85%;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  background-color: ${({ $isUser }) =>
    $isUser ? "var(--primary-color)" : "#ffffff"};
  color: ${({ $isUser }) => ($isUser ? "#ffffff" : "var(--text-primary)")};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 14px;
  padding: 8px 0;

  svg {
    width: 18px;
    height: 18px;
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
  gap: 8px;
  color: var(--primary-color);
  font-size: 14px;
  padding: 8px 0;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PlaceCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const PlaceCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const PlaceImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
`;

const PlaceInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const PlaceName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const PlaceAddress = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MoreButton = styled.button`
  align-self: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--text-muted);

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InputContainer = styled.div`
  flex-shrink: 0;
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1px solid var(--border-color);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--background);
  border-radius: 24px;
  padding: 12px 16px;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    color: var(--text-muted);
    cursor: not-allowed;
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
            ) : (
              <>
                <MessageBubble $isUser={message.type === "user"}>
                  {message.content}
                </MessageBubble>
                {message.places && (
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
                    {message.showMoreButton && (
                      <MoreButton>
                        <ChevronDownIcon />
                      </MoreButton>
                    )}
                  </PlaceCardList>
                )}
              </>
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

