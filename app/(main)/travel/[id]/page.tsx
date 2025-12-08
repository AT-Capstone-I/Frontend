"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/app/components";
import { 
  ThemeContent, 
  ClarifierData,
  requestContentAction, 
  submitClarifierAnswer 
} from "@/app/lib/api";

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

// ============ Clarifier 전체화면 스타일 (Survey 스타일) ============

const ClarifierOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--greyscale-000, #FFFFFF);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const ClarifierContainer = styled.div`
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: var(--greyscale-000, #FFFFFF);
  display: flex;
  flex-direction: column;
`;

const ClarifierTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  height: 50px;
`;

const ClarifierBackButton = styled.button`
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const ClarifierSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ClarifierContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const ClarifierQuestionNumber = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.042px;
  color: var(--primary-500, #4F9DE8);
  margin-bottom: 8px;
`;

const ClarifierTitle = styled.h1`
  font-family: 'Pretendard', sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.132px;
  color: var(--greyscale-1100, #111112);
  margin-bottom: 28px;
`;

const ClarifierInputWrapper = styled.div`
  margin-bottom: 20px;
`;

const ClarifierTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid var(--greyscale-300, #E1E1E4);
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: var(--greyscale-1100, #111112);
  resize: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &::placeholder {
    color: var(--greyscale-500, #AAA8AD);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-500, #4F9DE8);
    box-shadow: 0 0 0 3px rgba(79, 157, 232, 0.1);
  }
`;

const ClarifierPageIndicator = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-400, #C4C2C6);
  text-align: center;
  margin-top: auto;
  margin-bottom: 20px;
`;

const ClarifierBottomBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 18px 34px;
  background-color: var(--greyscale-000, #FFFFFF);
  box-shadow: 0px -3px 8px rgba(0, 0, 0, 0.06);
`;

const ClarifierButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const ClarifierNextButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  height: 56px;
  border: none;
  border-radius: 12px;
  background-color: ${({ $isActive }) => 
    $isActive ? 'var(--greyscale-900, #444246)' : 'var(--greyscale-300, #E1E1E4)'};
  color: var(--greyscale-000, #FFFFFF);
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.096px;
  cursor: ${({ $isActive }) => ($isActive ? 'pointer' : 'not-allowed')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ $isActive }) => 
      $isActive ? 'var(--greyscale-1000, #2B2A2C)' : 'var(--greyscale-300, #E1E1E4)'};
  }
`;

const ClarifierSkipAllButton = styled.button`
  width: 100%;
  height: 48px;
  padding: 12px 20px;
  background-color: var(--greyscale-200, #F2F1F2);
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--greyscale-700, #77747B);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--greyscale-300, #E1E1E4);
    color: var(--greyscale-800, #5E5B61);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// 기존 Modal 스타일 (호환성 유지용)
const ModalFooter = styled.div`
  padding: 16px 20px 24px;
  border-top: 1px solid var(--greyscale-200, #F2F1F2);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: var(--primary-500, #4F9DE8);
  color: var(--greyscale-000, #FFFFFF);
  border: none;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--primary-400, #66B2FE);
  }
  
  &:disabled {
    background-color: var(--greyscale-400, #C4C2C6);
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: transparent;
  color: var(--greyscale-700, #77747B);
  border: 1px solid var(--greyscale-300, #E1E1E4);
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--greyscale-100, #F8F8F8);
    border-color: var(--greyscale-400, #C4C2C6);
  }
`;

const SkipDescription = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--greyscale-600, #918E94);
  text-align: center;
  margin: 0;
`;

// 로딩 오버레이
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1001;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--primary-100, #E0F0FF);
  border-top-color: var(--primary-500, #4F9DE8);
  border-radius: 50%;
  animation: spinLoader 1s linear infinite;

  @keyframes spinLoader {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--greyscale-900, #444246);
  text-align: center;
`;

const LoadingSubtext = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--greyscale-600, #918E94);
  text-align: center;
  margin: 0;
`;

// 마크다운 텍스트 전처리 함수
const preprocessMarkdown = (text: string | undefined | null): string => {
  if (!text) return '';
  
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
const extractLastMessage = (text: string | undefined | null): string => {
  if (!text) return '이번 여행이 특별한 추억으로 남기를 바랍니다!';
  
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
  
  // Clarifier 관련 상태
  const [showClarifier, setShowClarifier] = useState(false);
  const [clarifierData, setClarifierData] = useState<ClarifierData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const storedContent = sessionStorage.getItem('selectedThemeContent');
    
    // 유효한 JSON 문자열인지 확인 (null, "undefined", 빈 문자열 제외)
    if (storedContent && storedContent !== 'undefined' && storedContent !== 'null') {
      try {
        const content: ThemeContent = JSON.parse(storedContent);
        
        // 파싱된 객체가 유효한지 확인
        if (content && typeof content === 'object') {
          setThemeContent(content);
          
          // 마크다운 전처리
          const processed = preprocessMarkdown(content.content_text);
          setProcessedMarkdown(processed);
          
          // 마지막 메시지 추출
          const lastMsg = extractLastMessage(content.content_text);
          setLastMessage(lastMsg);
        }
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

  // "여기로 결정하기" 버튼 클릭 핸들러
  const handleCreateSchedule = async () => {
    const tripId = params.id as string;
    if (!tripId) return;
    
    setIsSubmitting(true);
    setLoadingMessage('질문을 준비하고 있어요...');
    
    try {
      const response = await requestContentAction(tripId);
      
      if (response.status === 'clarifier_asking') {
        setClarifierData(response.clarifier);
        // 초기 answers 객체 생성
        const initialAnswers: Record<string, string> = {};
        response.clarifier.questions.forEach((q) => {
          initialAnswers[q.field_name] = '';
        });
        setAnswers(initialAnswers);
        setCurrentQuestionIndex(0);
        setShowClarifier(true);
      }
    } catch (error) {
      console.error('Content action 에러:', error);
      alert('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
      setLoadingMessage('');
    }
  };
  
  // 답변 입력 핸들러
  const handleAnswerChange = (fieldName: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };
  
  // 다음 질문으로 이동 또는 제출
  const handleNextQuestion = () => {
    if (!clarifierData) return;
    
    const isLastQuestion = currentQuestionIndex === clarifierData.questions.length - 1;
    
    if (isLastQuestion) {
      // 마지막 질문이면 제출
      handleSubmitAnswers();
    } else {
      // 다음 질문으로 이동
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // 이전 질문으로 이동
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // 첫 번째 질문에서 뒤로가기 - Clarifier 닫기
      setShowClarifier(false);
    }
  };
  
  // 답변 제출 핸들러
  const handleSubmitAnswers = async () => {
    const tripId = params.id as string;
    if (!tripId) return;
    
    setIsSubmitting(true);
    setLoadingMessage('여행 노트를 생성하고 있어요...');
    setShowClarifier(false);
    
    try {
      // 빈 답변 제거
      const filledAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([key, value]) => {
        if (value.trim()) {
          filledAnswers[key] = value.trim();
        }
      });
      
      const result = await submitClarifierAnswer(tripId, filledAnswers, false);
      
      if (result.status === 'completed') {
        // 여행노트 데이터를 sessionStorage에 저장
        const travelNoteData = {
          tripId,
          themeContent,
          clarifierAnswers: result.clarification_answers,
          userProfileSummary: result.user_profile_summary,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(`travelNote_${tripId}`, JSON.stringify(travelNoteData));
        
        // 여행 노트 페이지로 이동
        router.push(`/notes/${tripId}`);
      }
    } catch (error) {
      console.error('답변 제출 에러:', error);
      alert('답변 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      setShowClarifier(true);
    } finally {
      setIsSubmitting(false);
      setLoadingMessage('');
    }
  };
  
  // 건너뛰기 핸들러 (모든 질문 건너뛰기)
  const handleSkipAll = async () => {
    const tripId = params.id as string;
    if (!tripId) return;
    
    setIsSubmitting(true);
    setLoadingMessage('여행 노트를 생성하고 있어요...');
    setShowClarifier(false);
    
    try {
      const result = await submitClarifierAnswer(tripId, {}, true);
      
      if (result.status === 'completed') {
        // 여행노트 데이터를 sessionStorage에 저장
        const travelNoteData = {
          tripId,
          themeContent,
          clarifierAnswers: result.clarification_answers,
          userProfileSummary: result.user_profile_summary,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(`travelNote_${tripId}`, JSON.stringify(travelNoteData));
        
        // 여행 노트 페이지로 이동
        router.push(`/notes/${tripId}`);
      }
    } catch (error) {
      console.error('건너뛰기 에러:', error);
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setShowClarifier(true);
    } finally {
      setIsSubmitting(false);
      setLoadingMessage('');
    }
  };
  
  // 답변이 하나라도 입력되었는지 확인
  const hasAnyAnswer = Object.values(answers).some((v) => v.trim() !== '');

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
          <BottomButton onClick={handleCreateSchedule} disabled={isSubmitting}>
            여기로 결정하기
          </BottomButton>
        </ButtonWrapper>
      </Content>

      {/* Clarifier 질문 전체화면 (Survey 스타일) */}
      {showClarifier && clarifierData && clarifierData.questions.length > 0 && (
        <ClarifierOverlay>
          <ClarifierContainer>
            <ClarifierTopBar>
              <ClarifierBackButton onClick={handlePrevQuestion}>
                <svg width="8" height="16" viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M7 1L1 8L7 15" 
                    stroke="#111111" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </ClarifierBackButton>
              <ClarifierSpacer />
            </ClarifierTopBar>

            <ClarifierContent key={currentQuestionIndex}>
              <ClarifierQuestionNumber>
                질문 {currentQuestionIndex + 1}/{clarifierData.questions.length}
              </ClarifierQuestionNumber>
              <ClarifierTitle>
                {clarifierData.questions[currentQuestionIndex].question}
              </ClarifierTitle>

              <ClarifierInputWrapper>
                <ClarifierTextArea
                  placeholder="답변을 입력해주세요 (선택사항)"
                  value={answers[clarifierData.questions[currentQuestionIndex].field_name] || ''}
                  onChange={(e) => handleAnswerChange(
                    clarifierData.questions[currentQuestionIndex].field_name, 
                    e.target.value
                  )}
                />
              </ClarifierInputWrapper>

              <ClarifierPageIndicator>
                {currentQuestionIndex + 1}/{clarifierData.questions.length}
              </ClarifierPageIndicator>
            </ClarifierContent>

            <ClarifierBottomBar>
              <ClarifierButtonRow>
                <ClarifierNextButton 
                  $isActive={true}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex === clarifierData.questions.length - 1 ? '완료' : '다음'}
                </ClarifierNextButton>
              </ClarifierButtonRow>
              <ClarifierSkipAllButton onClick={handleSkipAll}>
                {clarifierData.skip_button.label || '질문 건너뛰기'}
              </ClarifierSkipAllButton>
            </ClarifierBottomBar>
          </ClarifierContainer>
        </ClarifierOverlay>
      )}

      {/* 로딩 오버레이 */}
      {isSubmitting && loadingMessage && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>{loadingMessage}</LoadingText>
          <LoadingSubtext>잠시만 기다려주세요</LoadingSubtext>
        </LoadingOverlay>
      )}
    </PageWrapper>
  );
}
