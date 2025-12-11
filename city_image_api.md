# 📖 Story Images API 문서

## `GET /api/story-images`

도시명만으로 스토리 이미지를 조회합니다.  
trip_id 없이 간단하게 도시 이미지를 가져올 수 있습니다.

---

## 📍 Endpoint

```
GET /api/story-images?city={도시명}
```

---

## 🔧 Parameters

| 파라미터  | 위치  | 타입    | 필수 | 기본값  | 설명                   |
| --------- | ----- | ------- | ---- | ------- | ---------------------- |
| `city`    | query | string  | ✅   | -       | 도시명 (자동 정규화됨) |
| `shuffle` | query | boolean | ❌   | `false` | 이미지 순서 랜덤 셔플  |
| `limit`   | query | integer | ❌   | `5`     | 반환할 이미지 개수     |

---

## 📤 Response

### 성공 (200 OK)

```typescript
interface StoryImagesResponse {
  city: string; // 정규화된 도시명 (예: "전남 여수시")
  city_en: string | null; // 영문 도시명 (예: "Yeosu, Jeonnam")
  images: string[]; // 이미지 URL 배열
  image_count: number; // 해당 도시의 전체 이미지 개수
}
```

**예시:**

```json
{
  "city": "전남 여수시",
  "city_en": "Yeosu, Jeonnam",
  "images": [
    "https://kfofjgkeksfvyjcggyoj.supabase.co/storage/v1/object/public/story-images/jeonnam_yeosu/1.jpeg",
    "https://kfofjgkeksfvyjcggyoj.supabase.co/storage/v1/object/public/story-images/jeonnam_yeosu/2.jpeg",
    "https://kfofjgkeksfvyjcggyoj.supabase.co/storage/v1/object/public/story-images/jeonnam_yeosu/3.jpeg"
  ],
  "image_count": 4
}
```

### 에러 (404 Not Found)

```json
{
  "detail": "No images found for city: {도시명}"
}
```

---

## 💡 도시명 자동 정규화

입력한 도시명이 자동으로 정규화됩니다.

| 입력     | 정규화 결과     | 설명                           |
| -------- | --------------- | ------------------------------ |
| `"여수"` | `"전남 여수시"` | 단순 도시명 → 정식 명칭        |
| `"강남"` | `"서울 강남구"` | 구 이름 → 시/구 형식           |
| `"서울"` | `"서울"`        | 광역시 → 모든 구 이미지 합침   |
| `"대전"` | `"대전"`        | 광역시 → 해당 지역 이미지 반환 |
| `"제주"` | `"제주 제주시"` | 도 → 대표 시 이미지            |

---

## 📱 Next.js 사용 예시

### 기본 사용

```typescript
const fetchCityImages = async (cityName: string) => {
  const response = await fetch(
    `/api/story-images?city=${encodeURIComponent(cityName)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
};

// 사용
const yeosu = await fetchCityImages("여수");
console.log(yeosu.city); // "전남 여수시"
console.log(yeosu.city_en); // "Yeosu, Jeonnam"
console.log(yeosu.images); // ["https://...", ...]
```

### 광역시 이미지 (서울 전체)

```typescript
// 서울 전체 구의 이미지를 랜덤으로 10장
const seoulImages = await fetch(
  "/api/story-images?city=서울&shuffle=true&limit=10"
).then((r) => r.json());

console.log(seoulImages.image_count); // 36 (전체 서울 이미지 수)
console.log(seoulImages.images.length); // 10 (요청한 개수)
```

### 배너/캐러셀 이미지

```typescript
// 홈 화면 배너용 랜덤 이미지
const getBannerImages = async (city: string, count: number = 5) => {
  return fetch(
    `/api/story-images?city=${encodeURIComponent(
      city
    )}&shuffle=true&limit=${count}`
  ).then((r) => r.json());
};

const bannerImages = await getBannerImages("부산", 3);
```

---

## 🎨 React 컴포넌트 예시

```tsx
interface CityImagesProps {
  city: string;
  count?: number;
}

const CityImages: React.FC<CityImagesProps> = ({ city, count = 5 }) => {
  const [data, setData] = useState<StoryImagesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/story-images?city=${encodeURIComponent(
        city
      )}&shuffle=true&limit=${count}`
    )
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      });
  }, [city, count]);

  if (loading) return <Skeleton />;
  if (!data || data.images.length === 0) return <div>이미지 없음</div>;

  return (
    <div className="city-images">
      <h3>{data.city}</h3>
      <span className="city-en">{data.city_en}</span>

      <div className="image-grid">
        {data.images.map((url, idx) => (
          <img key={idx} src={url} alt={`${data.city} ${idx + 1}`} />
        ))}
      </div>

      <p className="count">
        전체 {data.image_count}장 중 {data.images.length}장
      </p>
    </div>
  );
};
```

---

## ⏱️ 성능

| 케이스                   | 예상 응답 시간 |
| ------------------------ | -------------- |
| 이미지 있는 도시         | ~50-100ms      |
| 광역시 (이미지 집계)     | ~100-150ms     |
| city_en LLM 생성 필요 시 | ~500ms-1초     |

---

## 🗺️ 지원 도시 (60개)

**서울**: 강남구, 마포구, 종로구, 서초구, 송파구, 성동구, 용산구, 광진구, 영등포구  
**부산**: 수영구, 남구, 강서구, 사하구  
**대전**: 유성구  
**제주**: 제주시, 서귀포시  
**전남**: 여수시, 순천시, 목포시, 나주시, 구례군  
**전북**: 전주시, 군산시, 남원시  
**경남**: 창원시, 통영시, 거제시, 진주시  
**경북**: 경주시, 안동시, 포항시  
... 등
