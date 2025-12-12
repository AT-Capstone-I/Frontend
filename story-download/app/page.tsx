"use client";

import { useState, useCallback } from "react";

// Backend API URL
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://moodtrip-production.up.railway.app";

// API 응답 타입
interface User {
  user_id: string;
  username: string;
  created_at: string;
  story_image_url: string | null;
}

interface LookupResponse {
  count: number;
  users: User[];
}

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 닉네임으로 사용자 조회
  const handleSearch = useCallback(async () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUser(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/user-lookup?name=${encodeURIComponent(nickname.trim())}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("해당 닉네임을 찾을 수 없습니다");
        } else {
          setError("사용자 조회 중 오류가 발생했습니다");
        }
        return;
      }

      const data: LookupResponse = await response.json();

      if (!data.users || data.users.length === 0) {
        setError("사용자를 찾을 수 없습니다");
        return;
      }

      const foundUser = data.users[0];

      if (!foundUser.story_image_url) {
        setError("저장된 스토리 카드가 없습니다");
        return;
      }

      setUser(foundUser);
    } catch (err) {
      console.error("검색 오류:", err);
      setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [nickname]);

  // 이미지 다운로드
  const handleDownload = useCallback(async () => {
    if (!user?.story_image_url) return;

    try {
      const response = await fetch(user.story_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user.username}_moodtrip_story.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("다운로드 오류:", err);
      alert("다운로드 중 오류가 발생했습니다");
    }
  }, [user]);

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
        {user && user.story_image_url && (
          <section style={styles.resultSection}>
            <h2 style={styles.resultTitle}>
              {user.username}님의 스토리 카드
            </h2>
            <div style={styles.cardContainer}>
              <div style={styles.cardImageWrapper}>
                <img
                  src={user.story_image_url}
                  alt={`${user.username}의 여행 스토리`}
                  style={styles.cardImage}
                />
              </div>
              <button
                onClick={handleDownload}
                style={styles.downloadButton}
              >
                다운로드
              </button>
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
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
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
    alignItems: "center",
    gap: "20px",
  },
  resultTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    width: "100%",
    maxWidth: "300px",
  },
  cardImageWrapper: {
    width: "100%",
    aspectRatio: "9/16",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  downloadButton: {
    width: "100%",
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
  footer: {
    marginTop: "auto",
    paddingTop: "40px",
    paddingBottom: "20px",
    textAlign: "center",
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.5)",
  },
};
