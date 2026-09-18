import ScreenContainer from "@/components/ScreenContainer";
import LocationMapView from "@/components/address/LocationMapView";
import type { LocationMapViewHandle } from "@/components/address/LocationMapView.types";
import type { Region } from "@/types/Region";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

type DetectedParts = {
  addressLine: string;
  ward: string;
  province: string;
};

const reverseGeocodeFallback = async (
  lat: number,
  lng: number,
): Promise<DetectedParts | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    const place = results[0];
    if (!place) return null;

    const addressLine = [place.streetNumber, place.street || place.name]
      .filter(Boolean)
      .join(" ");
    const province = place.city || place.region || "";

    return {
      addressLine,
      ward: "",
      province,
    };
  } catch {
    return null;
  }
};

export default function SelectLocationScreen() {
  const params = useLocalSearchParams<{
    editId?: string;
    latitude?: string;
    longitude?: string;
    pickerKey?: string;
  }>();

  const mapRef = useRef<LocationMapViewHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const initialRegion: Region =
    params.latitude && params.longitude
      ? {
          latitude: Number(params.latitude),
          longitude: Number(params.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION;

  const [region, setRegion] = useState<Region>(initialRegion);
  const [previewAddress, setPreviewAddress] = useState(
    "Đang xác định vị trí...",
  );
  const [detectedParts, setDetectedParts] = useState<DetectedParts | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const applyResult = (parts: DetectedParts | null, requestId: number) => {
    if (requestId !== requestIdRef.current) {
      return;
    }

    if (parts) {
      setPreviewAddress(
        [parts.addressLine, parts.ward, parts.province]
          .filter(Boolean)
          .join(", ") || "Không xác định được địa chỉ",
      );

      setDetectedParts(parts);
    } else {
      setPreviewAddress("Không xác định được địa chỉ");
      setDetectedParts(null);
    }
  };

  const doReverseGeocode = async (lat: number, lng: number) => {
    const requestId = ++requestIdRef.current;
    setLoadingAddress(true);

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&accept-language=vi`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CleanWiseApp/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim status ${response.status}`);
      }

      const data = await response.json();
      const addr = data?.address;
      const displayName: string = data?.display_name || "";

      let streetPart = "";
      let ward = "";
      let province = "";

      if (addr) {
        streetPart = [
          addr.house_number,
          addr.road || addr.pedestrian || addr.footway,
        ]
          .filter(Boolean)
          .join(" ");

        province =
          addr.city || addr.state || addr.province || addr.region || "";
      }

      if (displayName) {
        const partsArray = displayName.split(",").map((s) => s.trim());

        const foundWard = partsArray.find(
          (item) =>
            item.toLowerCase().startsWith("phường") ||
            item.toLowerCase().startsWith("xã") ||
            item.toLowerCase().startsWith("thị trấn"),
        );

        if (foundWard) {
          ward = foundWard;
        }

        if (!province && partsArray.length > 0) {
          province = partsArray[partsArray.length - 2];
        }
      }

      let parts: DetectedParts | null = {
        addressLine: streetPart,
        ward,
        province,
      };

      if (!parts.addressLine || !parts.province) {
        const fallback = await reverseGeocodeFallback(lat, lng);
        if (fallback) {
          parts = {
            addressLine: parts.addressLine || fallback.addressLine,
            ward: parts.ward,
            province: parts.province || fallback.province,
          };
        }
      }

      applyResult(parts, requestId);
    } catch (err) {
      console.log("[reverseGeocode error - fallback to device]:", err);
      const fallback = await reverseGeocodeFallback(lat, lng);
      applyResult(fallback, requestId);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingAddress(false);
      }
    }
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      doReverseGeocode(lat, lng);
    }, 500);
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPreviewAddress("Bạn cần cấp quyền vị trí để dùng tính năng này");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});

      const newRegion: Region = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      mapRef.current?.animateToRegion(newRegion);
      setRegion(newRegion);
      reverseGeocode(newRegion.latitude, newRegion.longitude);
    } catch {
      setPreviewAddress(
        "Không thể lấy vị trí hiện tại. Vui lòng bật GPS và thử lại",
      );
    } finally {
      setLoadingGps(false);
    }
  };

  const handleConfirm = () => {
    const selectedParams = {
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      addressLine: detectedParts?.addressLine ?? "",
      ward: detectedParts?.ward ?? "",
      province: detectedParts?.province ?? "",
    };

    if (params.editId) {
      router.replace({
        pathname: "/profile/address/[id]",
        params: {
          id: params.editId,
          ...selectedParams,
        },
      });
      return;
    }

    router.replace({
      pathname: "/profile/address/add",
      params: {
        ...selectedParams,
        pickerKey: params.pickerKey ?? "",
      },
    });
  };

  return (
    <ScreenContainer>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-gray-100 bg-white z-10">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Chọn vị trí</Text>
        </View>

        <View className="flex-1">
          <LocationMapView
            ref={mapRef}
            initialRegion={initialRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
          />

          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
            style={{ marginBottom: 18 }}
          >
            <Feather name="map-pin" size={36} color="#047857" />
          </View>

          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={loadingGps}
            className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-white items-center justify-center shadow"
            activeOpacity={0.8}
          >
            <Feather name="navigation" size={20} color="#047857" />
          </TouchableOpacity>
        </View>

        <View className="px-6 pb-8 pt-4 border-t border-gray-100">
          <View className="flex-row items-start mb-4">
            <Feather
              name="map-pin"
              size={16}
              color="#6B7280"
              style={{ marginTop: 2 }}
            />
            <Text className="text-gray-700 text-sm ml-2 flex-1">
              {loadingAddress ? "Đang xác định địa chỉ..." : previewAddress}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              Chọn vị trí này
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
