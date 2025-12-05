# 🌊 MoodTrip - 감성 여행 플래너

<div align="center">

<img src="public/assets/icons/icon.svg" alt="MoodTrip Logo" width="120" height="120" />

### AI 기반 맞춤형 여행 추천 서비스

[![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Styled Components](https://img.shields.io/badge/Styled_Components-6.1-DB7093?style=for-the-badge&logo=styled-components&logoColor=white)](https://styled-components.com/)

[📱 데모 보기](#) · [🐛 버그 제보](https://github.com/AT-Capstone-I/Frontend/issues) · [✨ 기능 제안](https://github.com/AT-Capstone-I/Frontend/issues)

</div>

---

## 📖 프로젝트 소개

**MoodTrip**은 사용자의 기분과 취향에 맞는 여행지를 AI가 추천해주는 감성 여행 플래너입니다.

AI 챗봇과의 대화를 통해 나만의 맞춤 여행 테마를 생성하고, 실시간 날씨 기반 장소 추천까지 받을 수 있습니다.

<br/>

## ✨ 주요 기능

| 기능 | 설명 |
|:---:|:---|
| 🤖 **AI 채팅** | AI와 대화하며 여행 테마 생성 및 맞춤 추천 |
| 🎨 **테마 여행** | 감성 키워드 기반 여행 코스 추천 |
| 🌤️ **실시간 추천** | 날씨에 따른 인기 장소 실시간 추천 |
| 📝 **여행 노트** | 방문한 장소 리뷰 및 사진 기록 |
| ❤️ **찜하기** | 마음에 드는 장소 저장 |
| 📅 **일정 관리** | 여행 일정 확인 및 편집 |

<br/>

## 🛠️ 기술 스택

### Frontend

<div align="center">

| Category | Technologies |
|:--------:|:-------------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Styling** | ![Styled Components](https://img.shields.io/badge/Styled_Components-DB7093?style=flat-square&logo=styled-components&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Markdown** | ![React Markdown](https://img.shields.io/badge/React_Markdown-000000?style=flat-square&logo=markdown&logoColor=white) |
| **Linting** | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) |

</div>

### DevOps & Tools

<div align="center">

![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white)

</div>

<br/>

## 📁 프로젝트 구조

```
📦 Frontend
├── 📂 app
│   ├── 📂 (main)                    # 메인 레이아웃 그룹
│   │   ├── 📄 page.tsx              # 🏠 홈 페이지
│   │   ├── 📄 layout.tsx            # 메인 레이아웃 (네비게이션 포함)
│   │   ├── 📂 mypage                # 👤 마이페이지
│   │   ├── 📂 notes                 # 📝 여행 노트
│   │   ├── 📂 schedule              # 📅 오늘 일정
│   │   ├── 📂 place/[id]            # 📍 장소 상세
│   │   └── 📂 travel/[id]           # ✈️ 여행 상세
│   ├── 📂 chat                      # 🤖 AI 채팅
│   ├── 📂 signup                    # 📝 회원가입
│   ├── 📂 survey                    # 📋 취향 설문
│   ├── 📂 components                # 🧩 공통 컴포넌트
│   │   ├── 📂 cards                 # 카드 컴포넌트들
│   │   ├── 📄 BottomNavigation.tsx  # 하단 네비게이션
│   │   ├── 📄 ChatFab.tsx           # 채팅 플로팅 버튼
│   │   ├── 📄 Header.tsx            # 헤더
│   │   ├── 📄 ImageSlider.tsx       # 이미지 슬라이더
│   │   └── ...
│   ├── 📂 lib                       # 유틸리티
│   │   └── 📄 api.ts                # API 함수 및 타입
│   ├── 📂 styles                    # 스타일 설정
│   │   ├── 📄 StyledComponentsRegistry.tsx
│   │   └── 📄 theme.ts
│   ├── 📄 layout.tsx                # 루트 레이아웃
│   └── 📄 globals.css               # 글로벌 스타일
├── 📂 public                        # 정적 파일
│   └── 📂 assets
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 next.config.ts
```

<br/>

## 🚀 시작하기

### 요구사항

- **Node.js** 18.0 이상
- **npm** 또는 **yarn**

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/AT-Capstone-I/Frontend.git

# 2. 디렉토리 이동
cd Frontend

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

<br/>

## 📱 화면 구성

| 홈 화면 | AI 채팅 | 오늘 일정 |
|:---:|:---:|:---:|
| 인기 여행지 및 장소 탐색 | AI와 대화하며 테마 생성 | 일정 확인 및 실시간 추천 |

| 여행 상세 | 장소 상세 | 마이페이지 |
|:---:|:---:|:---:|
| 여행 코스 상세 정보 | 장소 정보 및 리뷰 | 내 정보 및 찜 목록 |

<br/>

## 🔗 API 연동

백엔드 API와 연동하여 다음 기능을 제공합니다:

- **SSE (Server-Sent Events)**: AI 채팅 실시간 스트리밍
- **REST API**: 여행/장소 데이터 조회, 사용자 정보 관리
- **세션 스토리지**: 채팅 히스토리 및 테마 데이터 임시 저장

<br/>

## 👥 팀원

<div align="center">

| Role | Name | GitHub |
|:----:|:----:|:------:|
| **Frontend** | 팀원1 | [@github](https://github.com/) |
| **Frontend** | 팀원2 | [@github](https://github.com/) |
| **Backend** | 팀원3 | [@github](https://github.com/) |
| **AI/ML** | 팀원4 | [@github](https://github.com/) |

</div>

<br/>

## 📄 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.

---

<div align="center">

**MoodTrip** - 당신의 감성에 맞는 여행을 찾아드립니다 🌊

⭐ 이 프로젝트가 마음에 드셨다면 Star를 눌러주세요!

</div>
