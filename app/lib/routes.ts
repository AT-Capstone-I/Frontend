// Google Routes API를 사용한 경로 계산
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
    // Routes 라이브러리에서 DirectionsService 가져오기
    const { DirectionsService } = (await google.maps.importLibrary(
      "routes"
    )) as google.maps.RoutesLibrary;

    const directionsService = new DirectionsService();

    const segments: RouteSegment[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // 각 세그먼트별로 경로 계산 (A->B, B->C, ...)
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];

      try {
        // DirectionsService용 요청 생성
        const request: google.maps.DirectionsRequest = {
          origin: origin.id.startsWith("ChIJ")
            ? { placeId: origin.id }
            : origin.location,
          destination: destination.id.startsWith("ChIJ")
            ? { placeId: destination.id }
            : destination.location,
          travelMode: google.maps.TravelMode.TRANSIT,
        };

        // DirectionsService.route() 호출
        const result = await directionsService.route(request);

        if (
          !result.routes ||
          result.routes.length === 0 ||
          !result.routes[0].legs ||
          result.routes[0].legs.length === 0
        ) {
          console.warn(
            `⚠️ No route found for segment ${i + 1}: ${origin.name} -> ${
              destination.name
            }`
          );
          // 직선 거리로 대체
          const directDistance = calculateDirectDistance(
            origin.location,
            destination.location
          );
          const estimatedDuration = Math.round((directDistance / 50) * 60); // 약 50m/min 도보 속도로 추정

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

        const route = result.routes[0];
        const leg = route.legs[0];

        // 거리 및 시간 파싱
        const distanceMeters = leg.distance?.value || 0;
        const durationSeconds = leg.duration?.value || 0;

        // Polyline 처리
        let polylineObj: RouteSegment["polyline"];
        if (route.overview_polyline) {
          polylineObj = { encodedPolyline: route.overview_polyline };
        }

        segments.push({
          origin,
          destination,
          distanceMeters,
          durationSeconds,
          travelDurationSeconds: durationSeconds,
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
        const estimatedDuration = Math.round((directDistance / 50) * 60);

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
