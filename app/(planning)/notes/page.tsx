"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

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

// 샘플 데이터
const notesData = [
  {
    id: 1,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.11.12",
    endDate: "11.15",
    status: "before" as const,
  },
  {
    id: 2,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.11.12",
    endDate: "11.15",
    status: "during" as const,
  },
  {
    id: 3,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.11.12",
    endDate: "11.15",
    status: "during" as const,
  },
  {
    id: 4,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.11.12",
    endDate: "11.15",
    status: "after" as const,
  },
];

const statusLabel = {
  before: "여행 전",
  during: "여행 중",
  after: "여행 후",
};

export default function NotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "before" | "during" | "after">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNoteClick = (noteId: number) => {
    router.push(`/notes/${noteId}`);
  };

  const filteredNotes = notesData.filter((note) => {
    if (activeTab !== "all" && note.status !== activeTab) return false;
    if (searchQuery && !note.name.includes(searchQuery)) return false;
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

        {filteredNotes.length > 0 ? (
          <NoteList>
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} onClick={() => handleNoteClick(note.id)}>
                <NoteInfo>
                  <NoteTextGroup>
                    <NoteName>{note.name}</NoteName>
                    <NoteAddress>{note.address}</NoteAddress>
                  </NoteTextGroup>
                  <NoteDate>{note.startDate} ~ {note.endDate}</NoteDate>
                </NoteInfo>
                <StatusBadge $status={note.status}>{statusLabel[note.status]}</StatusBadge>
              </NoteCard>
            ))}
          </NoteList>
        ) : (
          <EmptyState>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p>검색 결과가 없습니다.</p>
          </EmptyState>
        )}
      </Content>
    </PageWrapper>
  );
}
