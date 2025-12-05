"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/app/components";
import { ThemeContent } from "@/app/lib/api";

// Styled Components - Figma 디자인 적용
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #FFFFFF);
  padding-bottom: 100px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 13px 20px;
  position: sticky;
  top: 0;
  background-color: var(--greyscale-000, #FFFFFF);
  z-index: 10;
`;

const HeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const Content = styled.div`
  padding: 0 20px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
`;

const TravelTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.144px;
  color: var(--greyscale-1100, #111112);
`;

const TravelSubtitle = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-800, #5E5B61);
`;

const MainImageSection = styled.div`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 335/212;
  object-fit: cover;
  border-radius: 12px;
  background-color: var(--greyscale-200, #F1F1F1);
`;

const ImageIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
`;

const IndicatorDot = styled.div<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $active }) => 
    $active ? 'var(--greyscale-900, #444246)' : 'var(--greyscale-300, #E1E1E4)'};
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

// 마크다운 스타일 컨테이너
const MarkdownContent = styled.div`
  font-family: 'Pretendard', sans-serif;
  color: var(--greyscale-1100, #111112);
  line-height: 1.7;
  
  /* 인트로 문단 */
  & > p:first-of-type {
    font-size: 14px;
    padding: 24px 0;
    border-bottom: 1px solid var(--greyscale-200, #F2F1F2);
    margin-bottom: 24px;
  }
  
  /* 일반 문단 */
  p {
    font-size: 14px;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  
  /* 제목 (### 1. 장소명) */
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--greyscale-1100, #111112);
    margin-top: 24px;
    margin-bottom: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--greyscale-200, #F2F1F2);
    
    &:first-of-type {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
    }
  }
  
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--greyscale-1000, #2B2A2C);
    margin-top: 16px;
    margin-bottom: 8px;
  }
  
  /* 인용문 (> 설명) */
  blockquote {
    margin: 8px 0 16px 0;
    padding: 0;
    border: none;
    
    p {
      font-size: 14px;
      color: var(--greyscale-800, #5E5B61);
      margin: 0;
    }
  }
  
  /* 리스트 */
  ul {
    list-style: none;
    padding: 0;
    margin: 12px 0;
  }
  
  li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--greyscale-800, #5E5B61);
    line-height: 1.5;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      width: 3px;
      height: 14px;
      background-color: var(--primary-500, #4F9DE8);
      border-radius: 2px;
    }
  }
  
  /* 볼드 텍스트 */
  strong {
    font-weight: 600;
    color: var(--greyscale-1000, #2B2A2C);
  }
  
  /* 이모지 스타일링 */
  em {
    font-style: normal;
  }
  
  /* 구분선 */
  hr {
    border: none;
    border-top: 1px solid var(--greyscale-200, #F2F1F2);
    margin: 24px 0;
  }
  
  /* 링크 */
  a {
    color: var(--primary-500, #4F9DE8);
    text-decoration: underline;
  }
`;

// 정보 카드 스타일
const InfoCard = styled.div`
  background-color: var(--greyscale-100, #F8F8F8);
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.span`
  font-size: 14px;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: var(--greyscale-800, #5E5B61);
  line-height: 1.5;
  flex: 1;
  margin: 0;
  
  strong {
    font-weight: 500;
    color: var(--greyscale-1000, #2B2A2C);
  }
`;

const Section = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid var(--greyscale-200, #F2F1F2);
`;

const SectionTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1000, #2B2A2C);
  margin-bottom: 16px;
`;

const CarouselSection = styled.div`
  padding: 24px 0;
  border-bottom: 1px solid var(--greyscale-200, #F2F1F2);
`;

const CarouselScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CarouselItem = styled.div`
  flex-shrink: 0;
`;

const CarouselImage = styled.img`
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  background-color: var(--greyscale-200, #F1F1F1);
`;

const CarouselLabel = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-800, #5E5B61);
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const LastMessageSection = styled.section`
  padding: 24px 0;
  border-bottom: 1px solid var(--greyscale-200, #F2F1F2);
`;

const LastMessageContent = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: -0.042px;
  color: var(--greyscale-1100, #111112);
`;

const ButtonWrapper = styled.div`
  padding: 24px 20px 40px;
`;

const BottomButton = styled.button`
  width: 100%;
  padding: 18px 32px;
  background-color: var(--greyscale-900, #444246);
  color: var(--greyscale-000, #FFFFFF);
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--greyscale-600, #918E94);
  font-size: 14px;
`;

// 마크다운 텍스트 전처리 함수
const preprocessMarkdown = (text: string): string => {
  let processed = text;
  
  // ### 숫자. 형식을 ### 로 변환 (h3로 렌더링)
  processed = processed.replace(/###\s*(\d+)\.\s*/g, '### $1. ');
  
  // **숫자. 장소명** 형식을 ### 로 변환
  processed = processed.replace(/\*\*(\d+)\.\s*([^*]+)\*\*/g, '### $1. $2');
  
  // - 🌿, - ⭐, - 💡 형식의 정보를 깔끔하게 변환
  processed = processed.replace(/[-•]\s*🌿\s*분위기:?\s*/g, '- 🌿 **분위기:** ');
  processed = processed.replace(/[-•]\s*⭐\s*추천:?\s*/g, '- ⭐ **추천:** ');
  processed = processed.replace(/[-•]\s*💡\s*에디터\s*팁:?\s*/g, '- 💡 **에디터 팁:** ');
  
  // **에디터 팁** 형식 정리
  processed = processed.replace(/\*\*에디터\s*팁\*\*\s*[-–]\s*/g, '\n\n');
  
  // 📌 주소 정보 정리
  processed = processed.replace(/📌\s*/g, '\n📌 ');
  
  // 연속된 공백 라인 정리
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  return processed;
};

// 마지막 메시지 추출 함수
const extractLastMessage = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());
  
  // 마지막 몇 줄에서 일반 텍스트 찾기
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 10); i--) {
    const line = lines[i].trim();
    // 마크다운 기호나 이모지로 시작하지 않는 일반 문장
    if (
      line.length > 20 &&
      !line.startsWith('#') &&
      !line.startsWith('-') &&
      !line.startsWith('>') &&
      !line.startsWith('*') &&
      !line.match(/^[🌿⭐💡📌]/) &&
      !line.match(/^\d+\./)
    ) {
      return line;
    }
  }
  
  return '이번 여행이 특별한 추억으로 남기를 바랍니다!';
};

export default function TravelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [themeContent, setThemeContent] = useState<ThemeContent | null>(null);
  const [processedMarkdown, setProcessedMarkdown] = useState<string>('');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const storedContent = sessionStorage.getItem('selectedThemeContent');
    
    if (storedContent) {
      try {
        const content: ThemeContent = JSON.parse(storedContent);
        setThemeContent(content);
        
        // 마크다운 전처리
        const processed = preprocessMarkdown(content.content_text);
        setProcessedMarkdown(processed);
        
        // 마지막 메시지 추출
        const lastMsg = extractLastMessage(content.content_text);
        setLastMessage(lastMsg);
      } catch (error) {
        console.error('테마 콘텐츠 파싱 에러:', error);
      }
    }
    
    setIsLoading(false);
  }, [params.id]);

  // 이미지 슬라이더용 데이터
  const carouselImages = themeContent?.carousel_images
    ?.filter((img, index, self) => 
      index === self.findIndex(i => i.place_name === img.place_name)
    )
    .slice(0, 6) || [];

  const mainImages = carouselImages.map(img => img.image_url);

  const handleCreateSchedule = () => {
    router.push('/schedule');
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <Header>
          <BackButton />
          <HeaderSpacer />
        </Header>
        <LoadingWrapper>로딩 중...</LoadingWrapper>
      </PageWrapper>
    );
  }

  if (!themeContent) {
    return (
      <PageWrapper>
        <Header>
          <BackButton />
          <HeaderSpacer />
        </Header>
        <LoadingWrapper>콘텐츠를 찾을 수 없습니다.</LoadingWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header>
        <BackButton />
        <HeaderSpacer />
      </Header>

      <Content>
        <TitleSection>
          <TravelTitle>{themeContent.city_name}</TravelTitle>
          <TravelSubtitle>{themeContent.theme_phrase}</TravelSubtitle>
        </TitleSection>

        {/* 메인 이미지 */}
        {mainImages.length > 0 && (
          <MainImageSection>
            <MainImage 
              src={mainImages[currentImageIndex]} 
              alt={themeContent.city_name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop';
              }}
            />
            {mainImages.length > 1 && (
              <ImageIndicator>
                {mainImages.slice(0, 4).map((_, idx) => (
                  <IndicatorDot 
                    key={idx} 
                    $active={idx === currentImageIndex}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </ImageIndicator>
            )}
          </MainImageSection>
        )}

        {/* 마크다운 콘텐츠 */}
        <MarkdownContent>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {processedMarkdown}
          </ReactMarkdown>
        </MarkdownContent>

        {/* 이미지 캐러셀 */}
        {carouselImages.length > 0 && (
          <CarouselSection>
            <CarouselScroll>
              {carouselImages.map((img, idx) => (
                <CarouselItem key={idx}>
                  <CarouselImage 
                    src={img.image_url} 
                    alt={img.place_name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=90&fit=crop';
                    }}
                  />
                  <CarouselLabel>{img.place_name}</CarouselLabel>
                </CarouselItem>
              ))}
            </CarouselScroll>
          </CarouselSection>
        )}

        {/* 마지막 한마디 */}
        <LastMessageSection>
          <SectionTitle>마지막 한마디</SectionTitle>
          <LastMessageContent>
            {lastMessage}
          </LastMessageContent>
        </LastMessageSection>

        {/* 하단 버튼 */}
        <ButtonWrapper>
          <BottomButton onClick={handleCreateSchedule}>
            여기로 결정하기
          </BottomButton>
        </ButtonWrapper>
      </Content>
    </PageWrapper>
  );
}
