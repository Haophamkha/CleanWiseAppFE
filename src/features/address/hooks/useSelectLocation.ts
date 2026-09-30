// features/address/hooks/useSelectLocation.ts
import type { LocationMapViewHandle } from "@/features/address/components/LocationMapView.types";
import type { Region } from "@/features/address/types/Region";
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

const VIETMAP_API_KEY = process.env.EXPO_PUBLIC_VIETMAP_API_KEY ?? "";

const USE_VIETMAP_FOR_PREVIEW = false;

const USER_AGENT = "CleanWiseApp/1.0 (haophamdv0631@gmail.com)";

type DetectedParts = { addressLine: string; ward: string; province: string };
type RawParts = {
  addressLine: string;
  province: string;
  wardCandidates: string[];
};

const PROVINCE_API = "https://provinces.open-api.vn/api/v2";

type Named = { code: number; name: string };
let provincesCache: Named[] | null = null;
const wardsCache = new Map<number, Named[]>();
// Cache kết quả VietMap theo tọa độ (làm tròn ~11m) để không tốn hạn mức
const vietmapCache = new Map<string, DetectedParts>();

// Bỏ dấu + bỏ tiền tố hành chính để so khớp "Phường Bến Nghé" với "Bến Nghé"
const stripPrefix = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim()
    .replace(/^(thanh pho|tinh|phuong|xa|thi tran|dac khu)\s+/, "");

const fetchWithTimeout = async (
  url: string,
  headers: Record<string, string> = {},
  timeoutMs = 8000,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const getProvinces = async (): Promise<Named[]> => {
  if (provincesCache) return provincesCache;
  provincesCache = (await fetchWithTimeout(`${PROVINCE_API}/p/`)) as Named[];
  return provincesCache;
};

const getWards = async (provinceCode: number): Promise<Named[]> => {
  const cached = wardsCache.get(provinceCode);
  if (cached) return cached;
  const data = await fetchWithTimeout(
    `${PROVINCE_API}/p/${provinceCode}?depth=2`,
  );
  const wards: Named[] = data?.wards ?? [];
  wardsCache.set(provinceCode, wards);
  return wards;
};

// Đối chiếu với danh sách tỉnh/phường chuẩn 2025 để ra đúng tên "Phường ..."
const standardize = async (raw: RawParts): Promise<DetectedParts> => {
  console.log("[GEO] raw:", JSON.stringify(raw));
  const result: DetectedParts = {
    addressLine: raw.addressLine,
    ward: "",
    province: raw.province,
  };
  try {
    const provinces = await getProvinces();
    const province = provinces.find(
      (p) => stripPrefix(p.name) === stripPrefix(raw.province),
    );
    console.log("[GEO] province match:", province?.name ?? "KHÔNG KHỚP");
    if (!province) return result;

    result.province = province.name;
    const wards = await getWards(province.code);

    for (const candidate of raw.wardCandidates) {
      const key = stripPrefix(candidate);
      if (!key) continue;
      const ward = wards.find((w) => stripPrefix(w.name) === key);
      if (ward) {
        result.ward = ward.name;
        break;
      }
    }
  } catch (e) {
    console.log("[GEO] standardize LỖI:", e);
  }
  console.log("[GEO] kết quả:", JSON.stringify(result));
  return result;
};

// ---------- VietMap (hỗ trợ địa chỉ sau sáp nhập 1/7/2025) ----------
const fetchVietmap = async (lat: number, lng: number): Promise<RawParts> => {
  if (!VIETMAP_API_KEY) throw new Error("Thiếu EXPO_PUBLIC_VIETMAP_API_KEY");

  const data = await fetchWithTimeout(
    `https://maps.vietmap.vn/api/reverse?api-version=1.1&apikey=${VIETMAP_API_KEY}&point.lat=${lat}&point.lon=${lng}&size=1`,
    {},
    6000,
  );
  // Log thô để kiểm tra đúng cấu trúc response (xóa khi đã ổn định)
  console.log("[GEO] vietmap raw:", JSON.stringify(data).slice(0, 800));

  const list = Array.isArray(data) ? data : (data?.data ?? []);
  const item = list[0];
  if (!item) throw new Error("VietMap không có kết quả");

  // boundaries thường là [{type, name, prefix, full_name}, ...]
  const boundaries: {
    type?: number;
    name?: string;
    prefix?: string;
    full_name?: string;
  }[] = Array.isArray(item.boundaries) ? item.boundaries : [];

  const provinceB =
    boundaries.find((b) => b.type === 0) ?? boundaries[0] ?? undefined;
  const province = provinceB?.full_name || provinceB?.name || "";

  // Lấy mọi tên trong boundaries làm ứng viên phường; standardize sẽ chọn cái khớp
  const wardCandidates = boundaries
    .filter((b) => b !== provinceB)
    .flatMap((b) => [b.full_name, b.name])
    .filter(Boolean) as string[];

  // "address" thường là phần đường/số nhà; nếu không có thì dùng name
  const addressLine: string = item.address || item.name || "";

  return { addressLine, province, wardCandidates };
};

// Gọi VietMap + chuẩn hóa + cache. Trả null nếu lỗi/hết hạn mức.
const resolveViaVietmap = async (
  lat: number,
  lng: number,
): Promise<DetectedParts | null> => {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = vietmapCache.get(cacheKey);
  if (cached) return cached;

  try {
    const parts = await standardize(await fetchVietmap(lat, lng));
    vietmapCache.set(cacheKey, parts);
    return parts;
  } catch (e) {
    console.log("[GEO] vietmap LỖI:", e);
    return null;
  }
};

// ---------- Nguồn miễn phí: Photon ----------
const fetchPhoton = async (lat: number, lng: number): Promise<RawParts> => {
  const data = await fetchWithTimeout(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=default`,
    { "User-Agent": USER_AGENT },
  );
  const p = data?.features?.[0]?.properties ?? {};

  return {
    addressLine: [p.housenumber, p.street].filter(Boolean).join(" "),
    province: p.city || p.state || "",
    wardCandidates: [p.district, p.locality, p.county, p.name].filter(
      Boolean,
    ) as string[],
  };
};

// ---------- Nguồn miễn phí: Nominatim ----------
const fetchNominatim = async (lat: number, lng: number): Promise<RawParts> => {
  const data = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`,
    { "User-Agent": USER_AGENT, Accept: "application/json" },
  );

  const addr = data?.address ?? {};
  const displayItems: string[] = (data?.display_name || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const addressLine = [
    addr.house_number,
    addr.road || addr.pedestrian || addr.footway,
  ]
    .filter(Boolean)
    .join(" ");

  let province = addr.city || addr.state || addr.province || addr.region || "";
  if (!province && displayItems.length > 1) {
    province = displayItems[displayItems.length - 2];
  }

  const wardCandidates = [
    addr.suburb,
    addr.quarter,
    addr.neighbourhood,
    addr.village,
    addr.town,
    addr.city_district,
    addr.municipality,
    ...displayItems,
  ].filter(Boolean) as string[];

  return { addressLine, province, wardCandidates };
};

// ---------- Geocode của thiết bị (chỉ để bù tên đường/tỉnh) ----------
const deviceGeocode = async (
  lat: number,
  lng: number,
): Promise<RawParts | null> => {
  try {
    const place = (
      await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    )[0];
    if (!place) return null;
    return {
      addressLine: [place.streetNumber, place.street || place.name]
        .filter(Boolean)
        .join(" "),
      province: place.city || place.region || "",
      wardCandidates: [place.district, place.subregion].filter(
        Boolean,
      ) as string[],
    };
  } catch {
    return null;
  }
};

// Xem trước khi kéo bản đồ
const resolveAddress = async (
  lat: number,
  lng: number,
): Promise<DetectedParts | null> => {
  if (USE_VIETMAP_FOR_PREVIEW) {
    const vm = await resolveViaVietmap(lat, lng);
    if (vm && vm.ward) return vm;
  }

  let raw: RawParts | null = null;

  const sources: [string, (a: number, b: number) => Promise<RawParts>][] = [
    ["photon", fetchPhoton],
    ["nominatim", fetchNominatim],
  ];

  for (const [name, source] of sources) {
    try {
      const result = await source(lat, lng);
      console.log(`[GEO] ${name} OK:`, JSON.stringify(result));
      raw = raw
        ? {
            addressLine: raw.addressLine || result.addressLine,
            province: raw.province || result.province,
            wardCandidates: [...raw.wardCandidates, ...result.wardCandidates],
          }
        : result;
      // Đã có phường + đường + tỉnh thì dừng, không gọi thêm nguồn khác
      if (raw.wardCandidates.length && raw.addressLine && raw.province) break;
    } catch (e) {
      console.log(`[GEO] ${name} LỖI:`, e);
    }
  }

  if (!raw || !raw.addressLine || !raw.province) {
    const fb = await deviceGeocode(lat, lng);
    if (fb) {
      raw = {
        addressLine: raw?.addressLine || fb.addressLine,
        province: raw?.province || fb.province,
        wardCandidates: [...(raw?.wardCandidates ?? []), ...fb.wardCandidates],
      };
    }
  }

  return raw ? standardize(raw) : null;
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
  const confirmingRef = useRef(false);

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
  const [isConfirming, setIsConfirming] = useState(false);

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
    debounceRef.current = setTimeout(() => locate(lat, lng), 800);
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

  const confirmLocation = async () => {
    if (confirmingRef.current) return; // chặn bấm liên tục
    confirmingRef.current = true;
    setIsConfirming(true);

    try {
      // Lần gọi VietMap duy nhất: lấy phường/tỉnh chuẩn 2025 cho vị trí đã chọn.
      // Lỗi hoặc hết hạn mức thì dùng kết quả xem trước.
      const vm = await resolveViaVietmap(region.latitude, region.longitude);

      const selected = {
        latitude: String(region.latitude),
        longitude: String(region.longitude),
        addressLine: vm?.addressLine || detectedParts?.addressLine || "",
        ward: vm?.ward || detectedParts?.ward || "",
        province: vm?.province || detectedParts?.province || "",
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
    } finally {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  };

  return {
    mapRef,
    initialRegion,
    previewAddress,
    isLocating,
    isLoadingGps,
    isConfirming,
    onRegionChangeComplete,
    locateMe,
    confirmLocation,
  };
}
