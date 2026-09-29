// features/address/hooks/useSelectLocation.ts
import type { LocationMapViewHandle } from "@/components/address/LocationMapView.types";
import type { Region } from "@/types/Region";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

const DELTA = 0.01;
const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: DELTA,
  longitudeDelta: DELTA,
};

type DetectedParts = { addressLine: string; ward: string; province: string };

// Geocode của thiết bị: dự phòng khi Nominatim lỗi hoặc thiếu dữ liệu
const deviceGeocode = async (
  lat: number,
  lng: number,
): Promise<DetectedParts | null> => {
  try {
    const place = (
      await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    )[0];
    if (!place) return null;
    return {
      addressLine: [place.streetNumber, place.street || place.name]
        .filter(Boolean)
        .join(" "),
      ward: "",
      province: place.city || place.region || "",
    };
  } catch {
    return null;
  }
};

const fetchNominatim = async (
  lat: number,
  lng: number,
): Promise<DetectedParts> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CleanWiseApp/1.0",
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`Nominatim status ${response.status}`);

  const data = await response.json();
  const addr = data?.address;
  const displayName: string = data?.display_name || "";

  let addressLine = "";
  let ward = "";
  let province = "";

  if (addr) {
    addressLine = [
      addr.house_number,
      addr.road || addr.pedestrian || addr.footway,
    ]
      .filter(Boolean)
      .join(" ");
    province = addr.city || addr.state || addr.province || addr.region || "";
  }

  if (displayName) {
    const items = displayName.split(",").map((s) => s.trim());
    const foundWard = items.find((item) => {
      const t = item.toLowerCase();
      return (
        t.startsWith("phường") || t.startsWith("xã") || t.startsWith("thị trấn")
      );
    });
    if (foundWard) ward = foundWard;
    if (!province && items.length > 0) province = items[items.length - 2] ?? "";
  }

  return { addressLine, ward, province };
};

const resolveAddress = async (
  lat: number,
  lng: number,
): Promise<DetectedParts | null> => {
  try {
    let parts = await fetchNominatim(lat, lng);
    if (!parts.addressLine || !parts.province) {
      const fb = await deviceGeocode(lat, lng);
      if (fb) {
        parts = {
          addressLine: parts.addressLine || fb.addressLine,
          ward: parts.ward,
          province: parts.province || fb.province,
        };
      }
    }
    return parts;
  } catch {
    return deviceGeocode(lat, lng);
  }
};

export function useSelectLocation() {
  const params = useLocalSearchParams<{
    editId?: string;
    latitude?: string;
    longitude?: string;
    pickerKey?: string;
  }>();

  const mapRef = useRef<LocationMapViewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const initialRegion = useMemo<Region>(
    () =>
      params.latitude && params.longitude
        ? {
            latitude: Number(params.latitude),
            longitude: Number(params.longitude),
            latitudeDelta: DELTA,
            longitudeDelta: DELTA,
          }
        : DEFAULT_REGION,
    [params.latitude, params.longitude],
  );

  const [region, setRegion] = useState<Region>(initialRegion);
  const [previewAddress, setPreviewAddress] = useState(
    "Đang xác định vị trí...",
  );
  const [detectedParts, setDetectedParts] = useState<DetectedParts | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const locate = async (lat: number, lng: number) => {
    const requestId = ++requestIdRef.current;
    setIsLocating(true);
    const parts = await resolveAddress(lat, lng);
    if (requestId !== requestIdRef.current) return; // đã có yêu cầu mới hơn
    setDetectedParts(parts);
    setPreviewAddress(
      (parts &&
        [parts.addressLine, parts.ward, parts.province]
          .filter(Boolean)
          .join(", ")) ||
        "Không xác định được địa chỉ",
    );
    setIsLocating(false);
  };

  const scheduleLocate = (lat: number, lng: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => locate(lat, lng), 500);
  };

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
    scheduleLocate(r.latitude, r.longitude);
  };

  const locateMe = async () => {
    try {
      setIsLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPreviewAddress("Bạn cần cấp quyền vị trí để dùng tính năng này");
        return;
      }
      const current = await Location.getCurrentPositionAsync({});
      const next: Region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA,
      };
      mapRef.current?.animateToRegion(next);
      setRegion(next);
      scheduleLocate(next.latitude, next.longitude);
    } catch {
      setPreviewAddress(
        "Không thể lấy vị trí hiện tại. Vui lòng bật GPS và thử lại",
      );
    } finally {
      setIsLoadingGps(false);
    }
  };

  const confirmLocation = () => {
    const selected = {
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      addressLine: detectedParts?.addressLine ?? "",
      ward: detectedParts?.ward ?? "",
      province: detectedParts?.province ?? "",
    };

    if (params.editId) {
      router.replace({
        pathname: "/profile/address/[id]",
        params: { id: params.editId, ...selected },
      });
      return;
    }
    router.replace({
      pathname: "/profile/address/add",
      params: { ...selected, pickerKey: params.pickerKey ?? "" },
    });
  };

  return {
    mapRef,
    initialRegion,
    previewAddress,
    isLocating,
    isLoadingGps,
    onRegionChangeComplete,
    locateMe,
    confirmLocation,
  };
}
