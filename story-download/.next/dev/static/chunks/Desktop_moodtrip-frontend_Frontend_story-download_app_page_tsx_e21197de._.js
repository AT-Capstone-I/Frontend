(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Supabase 클라이언트 (환경변수에서)
const supabaseUrl = ("TURBOPACK compile-time value", "https://kfofjgkeksfvyjcggyoj.supabase.co/") || "";
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb2ZqZ2tla3NmdnlqY2dneW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA1MzAsImV4cCI6MjA3OTEyNjUzMH0.5ZiMAeR1oauDtvlQOHNnUv7dIKqv5C83-e0GwfehtLc") || "";
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseAnonKey);
// Backend API URL
const BACKEND_URL = ("TURBOPACK compile-time value", "https://moodtrip-production.up.railway.app") || "https://moodtrip-production.up.railway.app";
function Home() {
    _s();
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [storyCards, setStoryCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 닉네임으로 user_id 조회 및 스토리 카드 가져오기
    const handleSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleSearch]": async ()=>{
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
                const lookupResponse = await fetch(`${BACKEND_URL}/api/user-lookup?name=${encodeURIComponent(nickname.trim())}`);
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
                const { data: files, error: storageError } = await supabase.storage.from("user-story").list(userId, {
                    limit: 100,
                    sortBy: {
                        column: "created_at",
                        order: "desc"
                    }
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
                const cards = files.filter({
                    "Home.useCallback[handleSearch].cards": (file)=>file.name.endsWith(".png")
                }["Home.useCallback[handleSearch].cards"]).map({
                    "Home.useCallback[handleSearch].cards": (file)=>{
                        const { data: urlData } = supabase.storage.from("user-story").getPublicUrl(`${userId}/${file.name}`);
                        return {
                            name: file.name,
                            publicUrl: urlData.publicUrl,
                            createdAt: file.created_at || new Date().toISOString()
                        };
                    }
                }["Home.useCallback[handleSearch].cards"]);
                if (cards.length === 0) {
                    setError("저장된 스토리 카드가 없습니다");
                    setIsLoading(false);
                    return;
                }
                setStoryCards(cards);
            } catch (err) {
                console.error("검색 오류:", err);
                setError("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
            } finally{
                setIsLoading(false);
            }
        }
    }["Home.useCallback[handleSearch]"], [
        nickname
    ]);
    // 이미지 다운로드
    const handleDownload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleDownload]": async (card)=>{
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
        }
    }["Home.useCallback[handleDownload]"], []);
    // Enter 키 처리
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleKeyDown]": (e)=>{
            if (e.key === "Enter" && !isLoading) {
                handleSearch();
            }
        }
    }["Home.useCallback[handleKeyDown]"], [
        handleSearch,
        isLoading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: styles.main,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: styles.header,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: styles.logo,
                            children: "MoodTrip"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 162,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.subtitle,
                            children: "스토리 카드 다운로드"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 161,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: styles.searchSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.instruction,
                            children: "전시회에서 사용한 닉네임을 입력해주세요"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 168,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.inputWrapper,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: nickname,
                                    onChange: (e)=>setNickname(e.target.value),
                                    onKeyDown: handleKeyDown,
                                    placeholder: "닉네임 입력",
                                    style: styles.input,
                                    disabled: isLoading
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSearch,
                                    disabled: isLoading || !nickname.trim(),
                                    style: {
                                        ...styles.searchButton,
                                        opacity: isLoading || !nickname.trim() ? 0.5 : 1
                                    },
                                    children: isLoading ? "검색중..." : "검색"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 181,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.error,
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 193,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 167,
                    columnNumber: 9
                }, this),
                storyCards.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: styles.resultSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            style: styles.resultTitle,
                            children: [
                                userName,
                                "님의 스토리 카드 (",
                                storyCards.length,
                                "개)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 199,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.cardGrid,
                            children: storyCards.map((card, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.card,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: styles.cardImageWrapper,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: card.publicUrl,
                                                alt: `스토리 카드 ${index + 1}`,
                                                style: styles.cardImage
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                                lineNumber: 206,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                            lineNumber: 205,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleDownload(card),
                                            style: styles.downloadButton,
                                            children: "다운로드"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                            lineNumber: 212,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 204,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 202,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 198,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    style: styles.footer,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "MoodTrip - AI와 함께하는 감성 여행"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                        lineNumber: 226,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 225,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
            lineNumber: 159,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_s(Home, "CdUbNPwwZnnmmWV3tUtuXI3lmt0=");
_c = Home;
const styles = {
    main: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px"
    },
    container: {
        width: "100%",
        maxWidth: "430px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px"
    },
    header: {
        textAlign: "center",
        paddingTop: "40px"
    },
    logo: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: "8px"
    },
    subtitle: {
        fontSize: "16px",
        color: "rgba(255, 255, 255, 0.7)"
    },
    searchSection: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    instruction: {
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center"
    },
    inputWrapper: {
        display: "flex",
        gap: "12px",
        width: "100%"
    },
    input: {
        flex: 1,
        padding: "14px 16px",
        fontSize: "16px",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        outline: "none"
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
        transition: "all 0.2s ease"
    },
    error: {
        color: "#ff6b6b",
        fontSize: "14px",
        textAlign: "center"
    },
    resultSection: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    resultTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#ffffff"
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        width: "100%"
    },
    card: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        padding: "12px"
    },
    cardImageWrapper: {
        width: "100%",
        aspectRatio: "9/16",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.2)"
    },
    cardImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
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
        transition: "all 0.2s ease"
    },
    footer: {
        marginTop: "auto",
        paddingTop: "40px",
        paddingBottom: "20px",
        textAlign: "center",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.5)"
    }
};
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_moodtrip-frontend_Frontend_story-download_app_page_tsx_e21197de._.js.map