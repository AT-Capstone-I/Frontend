# 📖 콘텐츠 상세 조회 API - 프론트엔드 가이드

## 🔗 API 개요

```
GET /api/contents/{content_id}

```

**홈 화면에서 콘텐츠(테마) 카드 클릭 시 상세 정보 조회**

---

## 📥 Request

```
GET /api/contents/{content_id}

```

| 파라미터     | 타입          | 필수 | 설명                          |
| ------------ | ------------- | ---- | ----------------------------- |
| `content_id` | string (path) | ✅   | PlaceContentData의 content_id |

---

## 📤 Response

```tsx
interface ContentDetailResponse {
  content_id: string; // "317d2060-86aa-..."
  city_name: string; // "여수"
  theme_phrase: string; // "싱싱한 회가 선사하는 바다의 향연"
  content_text: string; // 콘텐츠 본문 (1000~1500자)
  representative_image: string | null; // 대표 이미지 URL
  carousel_images: CarouselImage[]; // 장소별 이미지 캐러셀
  place_ids: string[]; // ["google_ChIJ...", ...]
  place_count: number; // 4
  created_at: string; // "2025-01-20T10:30:00.000Z"
}

interface CarouselImage {
  place_id: string; // "google_ChIJ..."
  name: string; // "석천식당"
  images: string[]; // ["url1", "url2", "url3"] (최대 3개)
}
```

### 예시 응답

```json
{
  "content_id": "317d2060-86aa-4485-a349-8601d03e23a5",
  "city_name": "여수",
  "theme_phrase": "싱싱한 회가 선사하는 바다의 향연",
  "content_text": "여수 바다의 싱싱함을 온전히 느끼고 싶다면, 이번 코스를 따라가보세요. 아침부터 저녁까지 바다가 선사하는 맛의 여정이 펼쳐집니다...(중략)...오늘 하루, 여수의 맛에 푹 빠져보세요.",
  "representative_image": "<https://places.googleapis.com/v1/places/ChIJ.../media?maxWidthPx=1200&key=>...",
  "carousel_images": [
    {
      "place_id": "google_ChIJxx1234",
      "name": "석천식당",
      "images": [
        "<https://places.googleapis.com/v1/places/ChIJ.../media?maxWidthPx=1200&key=>...",
        "<https://places.googleapis.com/v1/places/ChIJ.../media?maxWidthPx=1200&key=>...",
        "<https://places.googleapis.com/v1/places/ChIJ.../media?maxWidthPx=1200&key=>..."
      ]
    },
    {
      "place_id": "google_ChIJyy5678",
      "name": "해물탕집",
      "images": ["...", "...", "..."]
    }
  ],
  "place_ids": [
    "google_ChIJxx1234",
    "google_ChIJyy5678",
    "google_ChIJzz9012",
    "google_ChIJww3456"
  ],
  "place_count": 4,
  "created_at": "2025-01-20T10:30:00.000Z"
}
```

---

## 🎨 React 구현

### Hook: useContentDetail

```tsx
// hooks/useContentDetail.ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ContentDetail {
  content_id: string;
  city_name: string;
  theme_phrase: string;
  content_text: string;
  representative_image: string | null;
  carousel_images: Array<{
    place_id: string;
    name: string;
    images: string[];
  }>;
  place_ids: string[];
  place_count: number;
  created_at: string;
}

export const useContentDetail = (contentId: string | null) => {
  const { data, error, isLoading } = useSWR<ContentDetail>(
    contentId
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/contents/${contentId}`
      : null,
    fetcher
  );

  return {
    content: data,
    isLoading,
    error,
  };
};
```
