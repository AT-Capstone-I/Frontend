"use client";

import { useState } from "react";
import styled from "styled-components";

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  padding-bottom: 80px;
`;

const TabNavigation = styled.nav`
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 0;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--text-muted)")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--text-primary);
    opacity: ${({ $active }) => ($active ? 1 : 0)};
  }
`;

const Content = styled.div`
  padding: 16px 20px;
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--background);
  color: var(--text-primary);

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const SearchIcon = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ListTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteItem = styled.div`
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
`;

const NoteHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? "90deg" : "0deg")});

  svg {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }
`;

const NoteInfo = styled.div`
  flex: 1;
`;

const NoteName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const NoteAddress = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
`;

const NoteDate = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
`;

const StatusBadge = styled.span<{ $status: "before" | "during" | "after" }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${({ $status }) => {
    switch ($status) {
      case "before":
        return "#e3f2fd";
      case "during":
        return "#e8f5e9";
      case "after":
        return "#f3e5f5";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case "before":
        return "#1565c0";
      case "during":
        return "#2e7d32";
      case "after":
        return "#7b1fa2";
      default:
        return "#666";
    }
  }};
`;

const NoteContent = styled.div<{ $expanded: boolean }>`
  max-height: ${({ $expanded }) => ($expanded ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const NoteContentInner = styled.div`
  padding: 0 16px 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
`;

const NoteDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`;

const NoteDetailImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
`;

const NoteDetailInfo = styled.div`
  flex: 1;
`;

const NoteDetailName = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const NoteDetailDesc = styled.p`
  font-size: 12px;
  color: var(--text-muted);
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
    color: var(--border-color);
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: var(--text-muted);
  }
`;

// 샘플 데이터
const notesData = [
  {
    id: 1,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.7.12",
    endDate: "7.15",
    status: "before" as const,
    places: [
      { name: "성심당 본점", desc: "대전 빵지순례 필수 코스", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop" },
      { name: "대전 스카이로드", desc: "야경 명소", image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: 2,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.7.12",
    endDate: "7.15",
    status: "during" as const,
    places: [],
  },
  {
    id: 3,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.7.12",
    endDate: "7.15",
    status: "during" as const,
    places: [],
  },
  {
    id: 4,
    name: "여행지 이름",
    address: "주소가 들어갑니다. 주소가 들어갑니다.",
    startDate: "2025.7.12",
    endDate: "7.15",
    status: "after" as const,
    places: [],
  },
];

const statusLabel = {
  before: "여행 전",
  during: "여행 중",
  after: "여행 후",
};

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "before" | "during" | "after">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredNotes = notesData.filter((note) => {
    if (activeTab !== "all" && note.status !== activeTab) return false;
    if (searchQuery && !note.name.includes(searchQuery)) return false;
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <SearchInput
            type="text"
            placeholder="여행지를 입력해 주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon aria-label="검색">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </SearchIcon>
        </SearchWrapper>

        <ListHeader>
          <ListTitle>여행지</ListTitle>
          <SortButton>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M6 12h12M9 18h6" />
            </svg>
            최신순
          </SortButton>
        </ListHeader>

        {filteredNotes.length > 0 ? (
          <NoteList>
            {filteredNotes.map((note) => (
              <NoteItem key={note.id}>
                <NoteHeader onClick={() => toggleExpand(note.id)}>
                  <ExpandIcon $expanded={expandedId === note.id}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </ExpandIcon>
                  <NoteInfo>
                    <NoteName>{note.name}</NoteName>
                    <NoteAddress>{note.address}</NoteAddress>
                    <NoteDate>{note.startDate} ~ {note.endDate}</NoteDate>
                  </NoteInfo>
                  <StatusBadge $status={note.status}>{statusLabel[note.status]}</StatusBadge>
                </NoteHeader>
                <NoteContent $expanded={expandedId === note.id}>
                  <NoteContentInner>
                    {note.places.length > 0 ? (
                      note.places.map((place, index) => (
                        <NoteDetailItem key={index}>
                          <NoteDetailImage src={place.image} alt={place.name} />
                          <NoteDetailInfo>
                            <NoteDetailName>{place.name}</NoteDetailName>
                            <NoteDetailDesc>{place.desc}</NoteDetailDesc>
                          </NoteDetailInfo>
                        </NoteDetailItem>
                      ))
                    ) : (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                        등록된 장소가 없습니다.
                      </p>
                    )}
                  </NoteContentInner>
                </NoteContent>
              </NoteItem>
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
