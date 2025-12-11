"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getTravelNotes, TravelNote, TravelNotesResponse, getUserId } from "@/app/lib/api";

// Styled Components - Figma Design System 적용
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--greyscale-000, #FFFFFF);
  padding-bottom: 104px;
`;

const TabNavigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--greyscale-300, #E1E1E4);
  background-color: var(--greyscale-000, #FFFFFF);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 10px 4px;
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: ${({ $active }) => ($active ? "var(--greyscale-1200, #111111)" : "var(--greyscale-600, #918E94)")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--primary-500, #4F9DE8);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

const Content = styled.div`
  padding: 28px 20px 20px;
`;

const SearchWrapper = styled.div`
  margin-bottom: 24px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 12px 16px;
  background-color: var(--greyscale-000, #FFFFFF);
  border: 1px solid var(--greyscale-700, #77747B);
  border-radius: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-family: 'Pretendard', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.045px;
  color: var(--greyscale-1200, #111111);
  outline: none;

  &::placeholder {
    color: var(--greyscale-500, #AAA8AD);
  }
`;

const SearchIcon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  color: var(--greyscale-700, #77747B);
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ListTitle = styled.h2`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.096px;
  color: var(--greyscale-1200, #2E2E2E);
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Pretendard', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.039px;
  color: var(--greyscale-800, #5E5B61);
  background: none;
  border: none;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoteCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background-color: var(--greyscale-000, #FFFFFF);
  border: 1px solid var(--greyscale-300, #E1E1E4);
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const NoteInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoteName = styled.h4`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.042px;
  color: var(--greyscale-1000, #2B2A2C);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoteAddress = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-600, #918E94);
  margin: 0;
`;

const NoteDate = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-400, #C4C2C6);
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: "before" | "during" | "after" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: 'Pretendard', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.033px;
  color: var(--greyscale-1000, #2B2A2C);
  white-space: nowrap;
  flex-shrink: 0;
  background-color: ${({ $status }) => {
    switch ($status) {
      case "before":
        return "var(--greyscale-100, #F1F1F1)";
      case "during":
        return "var(--primary-100, #E0F0FF)";
      case "after":
        return "#D2F3E8";
      default:
        return "var(--greyscale-100, #F1F1F1)";
    }
  }};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  svg {
    width: 64px;
    height: 64px;
    color: var(--greyscale-400, #C4C2C6);
    margin-bottom: 16px;
  }

  p {
    font-family: 'Pretendard', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--greyscale-600, #918E94);
  }
`;

// Icons
const SearchIconSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const SortIconSvg = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 4V16M10 4L6 8M10 4L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// API 상태를 UI 상태로 매핑
const tripStatusToUIStatus = (tripStatus: string): "before" | "during" | "after" => {
  switch (tripStatus) {
    case "planning":
      return "before";
    case "ongoing":
      return "during";
    case "completed":
      return "after";
    default:
      return "before";
  }
};

const statusLabel = {
  before: "여행 전",
  during: "여행 중",
  after: "여행 후",
};

// 날짜 포맷 헬퍼
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

const formatShortDate = (dateStr: string | null): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

export default function NotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "before" | "during" | "after">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<TravelNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 호출
  useEffect(() => {
    const fetchNotes = async () => {
      const userId = getUserId();
      if (!userId) {
        setIsLoading(false);
        setError("로그인이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);
        const data: TravelNotesResponse = await getTravelNotes(userId);
        
        // conversation_only는 제외하고, planning/ongoing/completed만 합침
        const allNotes = [
          ...data.planning,
          ...data.ongoing,
          ...data.completed,
        ];
        
        // 최신순 정렬
        allNotes.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        
        setNotes(allNotes);
        setError(null);
      } catch (e) {
        console.error("여행 노트 조회 실패:", e);
        setError("여행 노트를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleNoteClick = (tripId: string) => {
    router.push(`/notes/${tripId}`);
  };

  // 필터링된 노트
  const filteredNotes = notes.filter((note) => {
    const uiStatus = tripStatusToUIStatus(note.trip_status);
    if (activeTab !== "all" && uiStatus !== activeTab) return false;
    
    // 검색어 필터 (테마, 도시명으로 검색)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const themeMatch = note.selected_theme?.toLowerCase().includes(searchLower);
      const cityMatch = note.final_city?.toLowerCase().includes(searchLower);
      if (!themeMatch && !cityMatch) return false;
    }
    return true;
  });

  return (
    <PageWrapper>
      <TabNavigation>
        <TabButton $active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          전체
        </TabButton>
        <TabButton $active={activeTab === "before"} onClick={() => setActiveTab("before")}>
          여행 전
        </TabButton>
        <TabButton $active={activeTab === "during"} onClick={() => setActiveTab("during")}>
          여행 중
        </TabButton>
        <TabButton $active={activeTab === "after"} onClick={() => setActiveTab("after")}>
          여행 후
        </TabButton>
      </TabNavigation>

      <Content>
        <SearchWrapper>
          <SearchInputContainer>
            <SearchInput
              type="text"
              placeholder="여행지를 입력해 주세요."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon aria-label="검색">
              <SearchIconSvg />
            </SearchIcon>
          </SearchInputContainer>
        </SearchWrapper>

        <ListHeader>
          <ListTitle>여행지</ListTitle>
          <SortButton>
            <SortIconSvg />
            최신순
          </SortButton>
        </ListHeader>

        {isLoading ? (
          <EmptyState>
            <p>여행 노트를 불러오는 중...</p>
          </EmptyState>
        ) : error ? (
          <EmptyState>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
          </EmptyState>
        ) : filteredNotes.length > 0 ? (
          <NoteList>
            {filteredNotes.map((note) => {
              const uiStatus = tripStatusToUIStatus(note.trip_status);
              const displayName = note.selected_theme || note.final_city || "새 여행";
              const displayAddress = note.final_city || "";
              const startDateFormatted = formatDate(note.start_date);
              const endDateFormatted = formatShortDate(note.end_date);
              
              return (
                <NoteCard key={note.trip_id} onClick={() => handleNoteClick(note.trip_id)}>
                <NoteInfo>
                  <NoteTextGroup>
                      <NoteName>{displayName}</NoteName>
                      {displayAddress && <NoteAddress>{displayAddress}</NoteAddress>}
                  </NoteTextGroup>
                    {note.start_date && note.end_date ? (
                      <NoteDate>{startDateFormatted} ~ {endDateFormatted}</NoteDate>
                    ) : (
                      <NoteDate>날짜 미정</NoteDate>
                    )}
                </NoteInfo>
                  <StatusBadge $status={uiStatus}>{statusLabel[uiStatus]}</StatusBadge>
              </NoteCard>
              );
            })}
          </NoteList>
        ) : (
          <EmptyState>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p>{searchQuery ? "검색 결과가 없습니다." : "아직 여행 노트가 없습니다."}</p>
          </EmptyState>
        )}
      </Content>
    </PageWrapper>
  );
}
