"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 (환경변수에서)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Backend API URL
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://moodtrip-production.up.railway.app";

interface StoryCard {
  name: string;
  publicUrl: string;
  createdAt: string;
}

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storyCards, setStoryCards] = useState<StoryCard[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  // 닉네임으로 user_id 조회 및 스토리 카드 가져오기
  const handleSearch = useCallback(async () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStoryCards([]);
    setUserName(null);

    try {
      // 1. 백엔드 API로 user_id 조회
      const lookupResponse = await fetch(
        `${BACKEND_URL}/api/users/lookup?name=${encodeURIComponent(nickname.trim())}`
      );

      if (!lookupResponse.ok) {
        if (lookupResponse.status === 404) {
          setError("해당 닉네임을 찾을 수 없습니다");
        } else {
          setError("사용자 조회 중 오류가 발생했습니다");
        }
        setIsLoading(false);
        return;
      }

      // API 응답: { count: number, users: [{ user_id, username, created_at }] }
      const userData = await lookupResponse.json();

      if (!userData.users || userData.users.length === 0) {
        setError("사용자를 찾을 수 없습니다");
        setIsLoading(false);
        return;
      }

      const firstUser = userData.users[0];
      const userId = firstUser.user_id;

      if (!userId) {
        setError("사용자 정보를 가져올 수 없습니다");
        setIsLoading(false);
        return;
      }

      setUserName(firstUser.username || nickname);

      // 2. Supabase Storage에서 사용자의 스토리 카드 조회
      const { data: files, error: storageError } = await supabase.storage
        .from("user-story")
        .list(userId, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (storageError) {
        console.error("Storage 조회 오류:", storageError);
        setError("스토리 카드를 불러오는 중 오류가 발생했습니다");
        setIsLoading(false);
        return;
      }

      if (!files || files.length === 0) {
        setError("저장된 스토리 카드가 없습니다");
        setIsLoading(false);
        return;
      }

      // PNG 파일만 필터링 및 URL 생성
      const cards: StoryCard[] = files
        .filter((file) => file.name.endsWith(".png"))
        .map((file) => {
          const { data: urlData } = supabase.storage
            .from("user-story")
            .getPublicUrl(`${userId}/${file.name}`);

          return {
            name: file.name,
            publicUrl: urlData.publicUrl,
            createdAt: file.created_at || new Date().toISOString(),
          };
        });

      if (cards.length === 0) {
        setError("저장된 스토리 카드가 없습니다");
        setIsLoading(false);
        return;
      }

      setStoryCards(cards);
    } catch (err) {
      console.error("검색 오류:", err);
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [nickname]);

  // 이미지 다운로드
  const handleDownload = useCallback(async (card: StoryCard) => {
    try {
      const response = await fetch(card.publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = card.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("다운로드 오류:", err);
      alert("다운로드 중 오류가 발생했습니다");
    }
  }, []);

  // Enter 키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading) {
        handleSearch();
      }
    },
    [handleSearch, isLoading]
  );

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* 헤더 */}
        <header style={styles.header}>
          <h1 style={styles.logo}>MoodTrip</h1>
          <p style={styles.subtitle}>스토리 카드 다운로드</p>
        </header>

        {/* 검색 섹션 */}
        <section style={styles.searchSection}>
          <p style={styles.instruction}>
            전시회에서 사용한 닉네임을 입력해주세요
          </p>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="닉네임 입력"
              style={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !nickname.trim()}
              style={{
                ...styles.searchButton,
                opacity: isLoading || !nickname.trim() ? 0.5 : 1,
              }}
            >
              {isLoading ? "검색중..." : "검색"}
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </section>

        {/* 결과 섹션 */}
        {storyCards.length > 0 && (
          <section style={styles.resultSection}>
            <h2 style={styles.resultTitle}>
              {userName}님의 스토리 카드 ({storyCards.length}개)
            </h2>
            <div style={styles.cardGrid}>
              {storyCards.map((card, index) => (
                <div key={index} style={styles.card}>
                  <div style={styles.cardImageWrapper}>
                    <img
                      src={card.publicUrl}
                      alt={`스토리 카드 ${index + 1}`}
                      style={styles.cardImage}
                    />
                  </div>
                  <button
                    onClick={() => handleDownload(card)}
                    style={styles.downloadButton}
                  >
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 푸터 */}
        <footer style={styles.footer}>
          <p>MoodTrip - AI와 함께하는 감성 여행</p>
        </footer>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "430px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "32px",
  },
  header: {
    textAlign: "center",
    paddingTop: "40px",
  },
  logo: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.7)",
  },
  searchSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  instruction: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    width: "100%",
  },
  input: {
    flex: 1,
    padding: "14px 16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    outline: "none",
  },
  searchButton: {
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#4A90D9",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "14px",
    textAlign: "center",
  },
  resultSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "12px",
  },
  cardImageWrapper: {
    width: "100%",
    aspectRatio: "9/16",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  downloadButton: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4A90D9",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "40px",
    paddingBottom: "20px",
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
  },
};
