import LocationMapView from "@/components/address/LocationMapView";
import type { LocationMapViewHandle } from "@/components/address/LocationMapView.types";
import type { Region } from "@/types/Region";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function SelectLocationScreen() {
  const mapRef = useRef<LocationMapViewHandle>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [previewAddress, setPreviewAddress] = useState(
    "Đang xác định vị trí...",
  );
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const place = results[0];
      const text = place
        ? [place.streetNumber, place.street, place.district, place.city]
            .filter(Boolean)
            .join(", ")
        : "";
      setPreviewAddress(text || "Không xác định được địa chỉ");
    } catch {
      setPreviewAddress("Không xác định được địa chỉ");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

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
    } finally {
      setLoadingGps(false);
    }
  };

  const handleConfirm = () => {
    router.push({
      pathname: "/profile/address/add",
      params: {
        latitude: String(region.latitude),
        longitude: String(region.longitude),
        addressLine: previewAddress,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100 bg-white z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Chọn vị trí</Text>
      </View>

      <View className="flex-1">
        <LocationMapView
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Ghim cố định giữa màn hình, bản đồ di chuyển bên dưới */}
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={{ marginBottom: 36 }}
        >
          {/* <Feather name="map-pin" size={36} color="#047857" /> */}
        </View>

        {/* Nút định vị GPS - chỉ dùng expo-location, không cần BE */}
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
  );
}
