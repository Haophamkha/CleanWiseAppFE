// app/profile/address/select-location.tsx
import { ScreenHeader } from "@/components/common/ScreenHeader";
import ScreenContainer from "@/components/ScreenContainer";
import { COLORS } from "@/constants/theme";
import LocationMapView from "@/features/address/components/LocationMapView";
import { useSelectLocation } from "@/features/address/hooks/useSelectLocation";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PIN_SIZE = 44;
const PIN_HEIGHT = 52; // vòng tròn + mũi nhọn

const softShadow = {
  shadowColor: COLORS.ink,
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 16,
  elevation: 8,
} as const;

/** Thanh xám nhấp nháy khi đang xác định địa chỉ */
function Skeleton({ width, height = 14 }: { width: string; height?: number }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className="bg-line rounded-full"
      style={{ width: width as any, height, opacity }}
    />
  );
}

/** Ghim giữa bản đồ: nhấc lên khi đang tìm địa chỉ, rơi xuống khi xong */
function CenterPin({ locating }: { locating: boolean }) {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (locating) {
      Animated.timing(lift, {
        toValue: -14,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(lift, {
        toValue: 0,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }).start();
    }
  }, [locating, lift]);

  // Bóng dưới chân ghim co lại khi ghim nhấc lên
  const shadowScale = lift.interpolate({
    inputRange: [-14, 0],
    outputRange: [0.6, 1],
  });
  const shadowOpacity = lift.interpolate({
    inputRange: [-14, 0],
    outputRange: [0.15, 0.35],
  });

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {/* Bóng: tâm đúng ở giữa bản đồ */}
      <Animated.View
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 16,
          height: 6,
          marginLeft: -8,
          marginTop: -3,
          borderRadius: 8,
          backgroundColor: COLORS.ink,
          opacity: shadowOpacity,
          transform: [{ scale: shadowScale }],
        }}
      />

      {/* Ghim: mũi nhọn chạm đúng tâm bản đồ */}
      <Animated.View
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: PIN_SIZE,
          height: PIN_HEIGHT,
          marginLeft: -PIN_SIZE / 2,
          marginTop: -PIN_HEIGHT,
          transform: [{ translateY: lift }],
        }}
      >
        {/* Mũi nhọn */}
        <View
          style={{
            position: "absolute",
            bottom: 2,
            left: (PIN_SIZE - 12) / 2,
            width: 12,
            height: 12,
            backgroundColor: COLORS.primary,
            transform: [{ rotate: "45deg" }],
            borderRadius: 2,
          }}
        />
        {/* Vòng tròn */}
        <View
          className="bg-primary items-center justify-center"
          style={{
            width: PIN_SIZE,
            height: PIN_SIZE,
            borderRadius: PIN_SIZE / 2,
            borderWidth: 3,
            borderColor: "#FFFFFF",
            ...softShadow,
          }}
        >
          <Feather name="home" size={20} color="#FFFFFF" />
        </View>
      </Animated.View>
    </View>
  );
}

export default function SelectLocationScreen() {
  const s = useSelectLocation();

  // Tách "86 Lê Thánh Tôn, Phường Sài Gòn, Thành phố Hồ Chí Minh"
  // thành dòng chính + dòng phụ cho dễ đọc
  const [title, ...rest] = s.previewAddress.split(", ");
  const subtitle = rest.join(", ");

  return (
    <ScreenContainer>
      <ScreenHeader title="Chọn vị trí" />

      <View className="flex-1">
        <LocationMapView
          ref={s.mapRef}
          initialRegion={s.initialRegion}
          onRegionChangeComplete={s.onRegionChangeComplete}
        />

        <CenterPin locating={s.isLocating} />

        {/* Gợi ý phía trên */}
        <View
          pointerEvents="none"
          className="absolute top-3 left-0 right-0 items-center"
        >
          <View
            className="flex-row items-center rounded-full px-4 py-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              ...softShadow,
              shadowOpacity: 0.1,
              elevation: 3,
            }}
          >
            <Feather name="move" size={14} color={COLORS.primary} />
            <Text className="text-xs font-medium text-ink ml-2">
              Kéo bản đồ để chọn vị trí chính xác
            </Text>
          </View>
        </View>

        {/* Cụm nổi phía dưới: nút định vị + thẻ địa chỉ */}
        <View className="absolute left-0 right-0 bottom-0 px-4 pb-4">
          <View className="items-end mb-3">
            <TouchableOpacity
              onPress={s.locateMe}
              disabled={s.isLoadingGps}
              activeOpacity={0.85}
              className="w-12 h-12 rounded-full bg-surface items-center justify-center"
              style={softShadow}
            >
              {s.isLoadingGps ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Feather name="crosshair" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View className="bg-surface rounded-3xl p-5" style={softShadow}>
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 rounded-full bg-primary mr-2" />
              <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Vị trí đã chọn
              </Text>
            </View>

            <View className="flex-row items-start mb-5">
              <View className="w-11 h-11 rounded-2xl bg-primary-soft items-center justify-center mr-3">
                <Feather name="map-pin" size={20} color={COLORS.primary} />
              </View>

              <View className="flex-1 justify-center" style={{ minHeight: 44 }}>
                {s.isLocating ? (
                  <View>
                    <Skeleton width="75%" height={16} />
                    <View style={{ height: 8 }} />
                    <Skeleton width="55%" height={12} />
                  </View>
                ) : (
                  <View>
                    <Text
                      className="text-base font-bold text-ink"
                      numberOfLines={2}
                    >
                      {title}
                    </Text>
                    {!!subtitle && (
                      <Text
                        className="text-sm text-ink-soft mt-0.5"
                        numberOfLines={2}
                      >
                        {subtitle}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={s.confirmLocation}
              disabled={s.isConfirming}
              activeOpacity={0.85}
              className="bg-primary rounded-2xl flex-row items-center justify-center"
              style={{ height: 52, opacity: s.isConfirming ? 0.7 : 1 }}
            >
              {s.isConfirming ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#FFFFFF" />
                  <Text
                    className="text-base font-semibold ml-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    Xác nhận vị trí này
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
