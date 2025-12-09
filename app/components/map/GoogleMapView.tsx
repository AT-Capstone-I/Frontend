"use client";

import React, { useEffect, useRef } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

// 장소 데이터 타입
export interface PlaceLocation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

// 경로 세그먼트 타입
export interface RouteSegment {
  origin: PlaceLocation;
  destination: PlaceLocation;
  distanceMeters: number;
  durationSeconds: number;
  travelDurationSeconds: number;
  polyline?: {
    path?: google.maps.LatLng[];
    encodedPolyline?: string;
  };
}

interface GoogleMapViewProps {
  places: PlaceLocation[];
  routeSegments?: RouteSegment[];
  bottomPadding?: number; // 바텀시트 높이에 따른 동적 패딩
}

// 번호별 색상 팔레트 (마커와 경로에 동일하게 적용)
const MARKER_COLORS = [
  { bg: "#4F9DE8", border: "#3D8BD6" }, // 1번: 파란색
  { bg: "#FF6B6B", border: "#E85555" }, // 2번: 빨간색
  { bg: "#51CF66", border: "#40C057" }, // 3번: 초록색
  { bg: "#FFA94D", border: "#FF922B" }, // 4번: 주황색
  { bg: "#CC5DE8", border: "#BE4BDB" }, // 5번: 보라색
  { bg: "#20C997", border: "#12B886" }, // 6번: 청록색
  { bg: "#F06595", border: "#E64980" }, // 7번: 핑크색
  { bg: "#748FFC", border: "#5C7CFA" }, // 8번: 인디고
  { bg: "#FCC419", border: "#FAB005" }, // 9번: 노란색
  { bg: "#868E96", border: "#6c757d" }, // 10번: 회색
];

// 내부 Map 컴포넌트 (useMap 훅 사용을 위해 분리)
const MapContent: React.FC<GoogleMapViewProps> = ({
  places,
  routeSegments,
  bottomPadding = 40,
}) => {
  const map = useMap();
  const geometryLibrary = useMapsLibrary("geometry");
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const fitBoundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 경로 Polyline 렌더링
  useEffect(() => {
    if (!map || !geometryLibrary) return;

    // 기존 polyline 제거
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    if (!routeSegments || routeSegments.length === 0) return;

    routeSegments.forEach((segment, index) => {
      if (!segment.polyline) return;

      try {
        let path: google.maps.LatLng[] | null = null;

        if (segment.polyline.path) {
          path = segment.polyline.path;
        } else if (segment.polyline.encodedPolyline) {
          path = geometryLibrary.encoding.decodePath(
            segment.polyline.encodedPolyline
          );
        }

        if (!path) {
          console.warn(`⚠️ Segment ${index} has no valid path data`);
          return;
        }

        // 세그먼트 인덱스에 따라 다른 색상 적용
        const routeColor = MARKER_COLORS[index % MARKER_COLORS.length].bg;

        const polyline = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: routeColor, // 번호별 다른 색상
          strokeOpacity: 1,
          strokeWeight: 4,
          map: map,
        });

        polylinesRef.current.push(polyline);
      } catch (error) {
        console.error("❌ Error rendering polyline for segment", index, error);
      }
    });

    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, geometryLibrary, routeSegments]);

  // Fit Bounds - 모든 장소가 보이도록 조정 (바텀시트 높이에 따라 동적 패딩)
  useEffect(() => {
    if (map && places.length > 0) {
      // 기존 타이머 취소 (debounce)
      if (fitBoundsTimeoutRef.current) {
        clearTimeout(fitBoundsTimeoutRef.current);
      }

      // 약간의 딜레이로 너무 빈번한 호출 방지
      fitBoundsTimeoutRef.current = setTimeout(() => {
        const bounds = new window.google.maps.LatLngBounds();
        places.forEach((place) => {
          bounds.extend(place.location);
        });

        // 바텀시트 높이에 따른 동적 패딩
        // 상단: 80px (뒤로가기 버튼 여유), 하단: bottomPadding + 여유
        map.fitBounds(bounds, { 
          top: 80, 
          right: 40, 
          bottom: bottomPadding + 20, 
          left: 40 
        });

        // 장소가 1개일 때만 줌 레벨 조정
        if (places.length === 1) {
          const listener = map.addListener("idle", () => {
            map.setZoom(14);
            window.google.maps.event.removeListener(listener);
          });
        }
      }, 150); // 150ms debounce
    }

    return () => {
      if (fitBoundsTimeoutRef.current) {
        clearTimeout(fitBoundsTimeoutRef.current);
      }
    };
  }, [map, places, bottomPadding]);

  // 마커 색상 결정 (인덱스에 따라 다른 색상)
  const getPinColor = (index: number) => {
    return MARKER_COLORS[index % MARKER_COLORS.length];
  };

  return (
    <>
      {places.map((place, index) => {
        const colors = getPinColor(index);
        return (
          <AdvancedMarker key={place.id} position={place.location}>
            <Pin
              background={colors.bg}
              borderColor={colors.border}
              glyphColor={"white"}
              glyph={(index + 1).toString()}
              scale={1.1}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
};

// 메인 GoogleMapView 컴포넌트
const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  places,
  routeSegments,
  bottomPadding = 40,
}) => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "";

  if (!API_KEY) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E8E8E8",
          color: "#918E94",
          fontSize: "14px",
        }}
      >
        Google Maps API 키가 설정되지 않았습니다.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={API_KEY}
      libraries={["places", "marker", "geometry", "routes"]}
    >
      <GoogleMap
        defaultCenter={{ lat: 37.5665, lng: 126.978 }} // 서울 중심
        defaultZoom={10}
        mapId={MAP_ID}
        style={{ width: "100%", height: "100%" }}
        disableDefaultUI={true}
        gestureHandling="greedy"
        zoomControl={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
      >
        <MapContent places={places} routeSegments={routeSegments} bottomPadding={bottomPadding} />
      </GoogleMap>
    </APIProvider>
  );
};

export default GoogleMapView;
