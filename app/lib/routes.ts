// Google Routes API를 사용한 경로 계산
// Route.computeRoutes() 사용 (MoodTrip_Map과 동일)
// TRANSIT 모드 사용 (한국에서 DRIVING 미지원)

import {
  PlaceLocation,
  RouteSegment,
} from "@/app/components/map/GoogleMapView";

// 경로 계산 결과 타입
export interface RouteData {
  segments: RouteSegment[];
  distanceMeters: number;
  duration: string;
  totalTravelTimeSeconds: number;
}

// 거리 포맷팅 (m -> km)
export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

// 시간 포맷팅 (초 -> 분/시간)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

// 도보 속도 (m/min) - 약 5km/h
const WALKING_SPEED_M_PER_MIN = 83;

// 비정상적인 시간 판단 기준 (거리 대비 시간이 도보의 3배 이상이면 비정상)
const UNREASONABLE_TIME_MULTIPLIER = 3;

/**
 * 두 좌표 간의 직선 거리를 계산합니다 (Haversine 공식)
 * @param from 시작 좌표
 * @param to 끝 좌표
 * @returns 거리 (미터)
 */
const calculateDirectDistance = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number => {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

/**
 * 시간이 합리적인지 체크합니다.
 * 거리 대비 시간이 도보의 3배 이상이면 비정상으로 판단
 * @param distanceMeters 거리 (미터)
 * @param durationSeconds 시간 (초)
 * @returns 합리적인 시간인지 여부
 */
const isReasonableTime = (
  distanceMeters: number,
  durationSeconds: number
): boolean => {
  // 도보 예상 시간 (초)
  const walkingTimeSeconds = (distanceMeters / WALKING_SPEED_M_PER_MIN) * 60;
  // 대중교통 시간이 도보의 3배 이상이면 비정상
  return durationSeconds <= walkingTimeSeconds * UNREASONABLE_TIME_MULTIPLIER;
};

/**
 * 도보 기반 예상 시간을 계산합니다.
 * @param distanceMeters 거리 (미터)
 * @returns 예상 시간 (초)
 */
const estimateWalkingTime = (distanceMeters: number): number => {
  return Math.round((distanceMeters / WALKING_SPEED_M_PER_MIN) * 60);
};

/**
 * 여러 장소 간의 경로를 계산합니다.
 * Google Routes API의 Route.computeRoutes()를 사용합니다.
 *
 * @param places 경로를 계산할 장소 목록 (최소 2개 필요)
 * @returns 경로 데이터 (세그먼트별 거리, 시간, polyline 포함)
 */
export const calculateRoute = async (
  places: PlaceLocation[]
): Promise<RouteData | null> => {
  if (places.length < 2) return null;

  // Google Maps 라이브러리가 로드되었는지 확인
  if (typeof google === "undefined" || !google.maps) {
    console.error("❌ Google Maps library not loaded");
    return null;
  }

  try {
    // Routes 라이브러리에서 Route 클래스 가져오기 (MoodTrip_Map과 동일)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Route } = (await google.maps.importLibrary("routes")) as any;
    const { Place } = (await google.maps.importLibrary(
      "places"
    )) as google.maps.PlacesLibrary;

    const segments: RouteSegment[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // 각 세그먼트별로 경로 계산 (A->B, B->C, ...)
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];

      try {
        // Place 인스턴스 생성 (Place ID가 있는 경우)
        let originPlace;
        let destinationPlace;

        if (origin.id.startsWith("ChIJ")) {
          originPlace = new Place({ id: origin.id });
        } else {
          originPlace = origin.location;
        }

        if (destination.id.startsWith("ChIJ")) {
          destinationPlace = new Place({ id: destination.id });
        } else {
          destinationPlace = destination.location;
        }

        // MoodTrip_Map과 동일한 요청 형식
        const request = {
          origin: originPlace,
          destination: destinationPlace,
          travelMode: "TRANSIT",
          fields: ["*"],
        };

        // Route.computeRoutes() 호출
        const { routes } = await Route.computeRoutes(request);

        if (!routes || routes.length === 0) {
          console.warn(
            `⚠️ No route found for segment ${i + 1}: ${origin.name} -> ${destination.name}`
          );
          // 직선 거리로 대체
          const directDistance = calculateDirectDistance(
            origin.location,
            destination.location
          );
          const estimatedDuration = estimateWalkingTime(directDistance);

          segments.push({
            origin,
            destination,
            distanceMeters: Math.round(directDistance),
            durationSeconds: estimatedDuration,
            travelDurationSeconds: estimatedDuration,
          });

          totalDistance += Math.round(directDistance);
          totalDuration += estimatedDuration;
          continue;
        }

        const route = routes[0];

        // 시간 파싱 (MoodTrip_Map과 동일한 로직)
        let durationSeconds = 0;
        if (route.durationMillis) {
          durationSeconds = Math.round(route.durationMillis / 1000);
        } else if (route.staticDurationMillis) {
          durationSeconds = Math.round(route.staticDurationMillis / 1000);
        } else if (route.duration) {
          durationSeconds = parseInt(route.duration.replace("s", ""));
        }

        // 순수 이동 시간 계산 (legs 합산)
        let travelDurationSeconds = 0;
        if (route.legs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          travelDurationSeconds = route.legs.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (acc: number, leg: any) => {
              const legDuration = leg.durationMillis
                ? Math.round(leg.durationMillis / 1000)
                : leg.duration
                  ? parseInt(leg.duration.replace("s", ""))
                  : 0;
              return acc + legDuration;
            },
            0
          );
        }

        // Fallback
        if (durationSeconds === 0 && travelDurationSeconds > 0) {
          durationSeconds = travelDurationSeconds;
        }

        const distanceMeters = route.distanceMeters || 0;

        // 🔥 비정상적인 시간 체크 (fallback 로직)
        // 거리 대비 시간이 도보의 3배 이상이면 도보 시간으로 대체
        if (!isReasonableTime(distanceMeters, durationSeconds)) {
          console.warn(
            `⚠️ Unreasonable transit time for segment ${i + 1}: ${formatDistance(distanceMeters)} in ${formatDuration(durationSeconds)}`
          );
          console.warn(
            `   → Using walking time estimate instead: ${formatDuration(estimateWalkingTime(distanceMeters))}`
          );
          durationSeconds = estimateWalkingTime(distanceMeters);
          travelDurationSeconds = durationSeconds;
        }

        // Polyline 처리 (MoodTrip_Map과 동일)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routeAny = route as any;
        let polylineObj: RouteSegment["polyline"];
        if (routeAny.polyline) {
          polylineObj = routeAny.polyline;
        } else if (routeAny.path) {
          polylineObj = { path: routeAny.path };
        }

        segments.push({
          origin,
          destination,
          distanceMeters,
          durationSeconds,
          travelDurationSeconds: travelDurationSeconds || durationSeconds,
          polyline: polylineObj,
        });

        totalDistance += distanceMeters;
        totalDuration += durationSeconds;
      } catch (segmentError) {
        console.error(`❌ Error calculating segment ${i + 1}:`, segmentError);

        // 오류 시 직선 거리로 대체
        const directDistance = calculateDirectDistance(
          origin.location,
          destination.location
        );
        const estimatedDuration = estimateWalkingTime(directDistance);

        segments.push({
          origin,
          destination,
          distanceMeters: Math.round(directDistance),
          durationSeconds: estimatedDuration,
          travelDurationSeconds: estimatedDuration,
        });

        totalDistance += Math.round(directDistance);
        totalDuration += estimatedDuration;
      }
    }

    // 총 순수 이동 시간 계산
    const totalTravelTimeSeconds = segments.reduce(
      (acc, seg) => acc + (seg.travelDurationSeconds || 0),
      0
    );

    return {
      segments,
      distanceMeters: totalDistance,
      duration: `${totalDuration}s`,
      totalTravelTimeSeconds,
    };
  } catch (error) {
    console.error("❌ Route calculation failed:", error);
    return null;
  }
};

/**
 * 경로 계산 결과에서 각 세그먼트의 이동 정보를 포맷팅합니다.
 * @param routeData 경로 데이터
 * @returns 포맷팅된 이동 정보 배열
 */
export const formatRouteLegs = (
  routeData: RouteData | null
): Array<{
  distance: string;
  duration: string;
}> => {
  if (!routeData) return [];

  return routeData.segments.map((segment) => ({
    distance: formatDistance(segment.distanceMeters),
    duration: formatDuration(
      segment.travelDurationSeconds || segment.durationSeconds
    ),
  }));
};
