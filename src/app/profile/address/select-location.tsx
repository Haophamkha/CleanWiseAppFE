// app/profile/address/select-location.tsx
import ScreenContainer from "@/components/ScreenContainer";
import LocationMapView from "@/components/address/LocationMapView";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { useSelectLocation } from "@/features/address/hooks/useSelectLocation";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function SelectLocationScreen() {
  const s = useSelectLocation();

  return (
    <ScreenContainer>
      <ScreenHeader title="Chọn vị trí" />

      <View className="flex-1">
        <LocationMapView
          ref={s.mapRef}
          initialRegion={s.initialRegion}
          onRegionChangeComplete={s.onRegionChangeComplete}
        />

        {/* Ghim cố định giữa bản đồ */}
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
          style={{ marginBottom: 18 }}
        >
          <Feather name="map-pin" size={38} color={COLORS.primary} />
        </View>

        <TouchableOpacity
          onPress={s.locateMe}
          disabled={s.isLoadingGps}
          activeOpacity={0.8}
          className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-surface items-center justify-center"
          style={{
            shadowColor: COLORS.ink,
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {s.isLoadingGps ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Feather name="navigation" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-4 pb-4 bg-surface border-t border-line">
        <View className="flex-row items-start mb-4">
          <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center mr-3">
            <Feather name="map-pin" size={17} color={COLORS.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-0.5">
              Vị trí đã chọn
            </Text>
            {s.isLocating ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text className="text-sm text-ink-soft ml-2">
                  Đang xác định địa chỉ...
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-ink" numberOfLines={3}>
                {s.previewAddress}
              </Text>
            )}
          </View>
        </View>

        <Button title="Chọn vị trí này" onPress={s.confirmLocation} />
      </View>
    </ScreenContainer>
  );
}
