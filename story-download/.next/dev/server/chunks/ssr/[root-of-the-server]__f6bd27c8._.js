module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
// Backend API URL
const BACKEND_URL = ("TURBOPACK compile-time value", "https://moodtrip-production.up.railway.app") || "https://moodtrip-production.up.railway.app";
function Home() {
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // 닉네임으로 사용자 조회
    const handleSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!nickname.trim()) {
            setError("닉네임을 입력해주세요");
            return;
        }
        setIsLoading(true);
        setError(null);
        setUser(null);
        try {
            const response = await fetch(`${BACKEND_URL}/api/user-lookup?name=${encodeURIComponent(nickname.trim())}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setError("해당 닉네임을 찾을 수 없습니다");
                } else {
                    setError("사용자 조회 중 오류가 발생했습니다");
                }
                return;
            }
            const data = await response.json();
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
        } finally{
            setIsLoading(false);
        }
    }, [
        nickname
    ]);
    // 이미지 다운로드
    const handleDownload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
    }, [
        user
    ]);
    // Enter 키 처리
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.key === "Enter" && !isLoading) {
            handleSearch();
        }
    }, [
        handleSearch,
        isLoading
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: styles.main,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    style: styles.header,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: styles.logo,
                            children: "MoodTrip"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 113,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.subtitle,
                            children: "스토리 카드 다운로드"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: styles.searchSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.instruction,
                            children: "전시회에서 사용한 닉네임을 입력해주세요"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.inputWrapper,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: nickname,
                                    onChange: (e)=>setNickname(e.target.value),
                                    onKeyDown: handleKeyDown,
                                    placeholder: "닉네임 입력",
                                    style: styles.input,
                                    disabled: isLoading
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSearch,
                                    disabled: isLoading || !nickname.trim(),
                                    style: {
                                        ...styles.searchButton,
                                        opacity: isLoading || !nickname.trim() ? 0.5 : 1
                                    },
                                    children: isLoading ? "검색중..." : "검색"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: styles.error,
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 144,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this),
                user && user.story_image_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: styles.resultSection,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            style: styles.resultTitle,
                            children: [
                                user.username,
                                "님의 스토리 카드"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 150,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: styles.cardContainer,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.cardImageWrapper,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: user.story_image_url,
                                        alt: `${user.username}의 여행 스토리`,
                                        style: styles.cardImage
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                        lineNumber: 155,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 154,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleDownload,
                                    style: styles.downloadButton,
                                    children: "다운로드"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                                    lineNumber: 161,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                            lineNumber: 153,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 149,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    style: styles.footer,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$moodtrip$2d$frontend$2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "MoodTrip - AI와 함께하는 감성 여행"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
            lineNumber: 110,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/moodtrip-frontend/Frontend/story-download/app/page.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
const styles = {
    main: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
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
        alignItems: "center",
        gap: "20px"
    },
    resultTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center"
    },
    cardContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "300px"
    },
    cardImageWrapper: {
        width: "100%",
        aspectRatio: "9/16",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
    },
    cardImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
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
}),
"[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/moodtrip-frontend/Frontend/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f6bd27c8._.js.map