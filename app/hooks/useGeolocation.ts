"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = "moodtrip_user_location";

interface StoredLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

/** 캐시된 위치가 유효한 시간 (30분) */
const CACHE_TTL = 30 * 60 * 1000;

function getCachedLocation(): StoredLocation | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredLocation = JSON.parse(stored);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function cacheLocation(latitude: number, longitude: number) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ latitude, longitude, timestamp: Date.now() })
  );
}

/**
 * 사용자의 현재 위치를 가져오는 훅
 * - 브라우저 Geolocation API 사용
 * - localStorage에 30분간 캐시
 * - 권한 거부/실패 시 error 반환 (latitude, longitude는 null)
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 1. 캐시 확인
    const cached = getCachedLocation();
    if (cached) {
      setState({
        latitude: cached.latitude,
        longitude: cached.longitude,
        loading: false,
        error: null,
      });
      return;
    }

    // 2. Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "이 브라우저에서는 위치 서비스를 지원하지 않습니다.",
      }));
      return;
    }

    // 3. 현재 위치 요청
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        cacheLocation(latitude, longitude);
        setState({
          latitude,
          longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        let errorMessage = "위치를 가져올 수 없습니다.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "위치 권한이 거부되었습니다.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "위치 요청 시간이 초과되었습니다.";
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: CACHE_TTL,
      }
    );
  }, []);

  return state;
}
