// app/profile/address/choose-method.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import type { FeatherName } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

const RADIUS = 20;

function MethodCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: FeatherName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  // 0 = bình thường, 1 = đang nhấn
  const press = useRef(new Animated.Value(0)).current;

  const animateTo = (value: number) =>
    Animated.timing(press, {
      toValue: value,
      duration: value === 1 ? 110 : 180,
      useNativeDriver: true,
    }).start();

  const scale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });
  const arrowX = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });
  const tintOpacity = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.06],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(1)}
        onPressOut={() => animateTo(0)}
        accessibilityRole="button"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: RADIUS,
            backgroundColor: COLORS.surface,
            borderWidth: 1.5,
            borderColor: COLORS.line,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Lớp phủ màu chính nhạt khi nhấn */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: RADIUS,
                backgroundColor: COLORS.primary,
                opacity: tintOpacity,
              },
            ]}
          />
          {/* Viền màu chính hiện dần khi nhấn */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: RADIUS,
                borderWidth: 1.5,
                borderColor: COLORS.primary,
                opacity: press,
              },
            ]}
          />

          {/* Vòng icon: nền nhạt cố định */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 26,
                  backgroundColor: COLORS.primary,
                  opacity: 0.12,
                },
              ]}
            />
            <Feather name={icon} size={24} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text className="text-base font-bold text-ink mb-1">{title}</Text>
            <Text className="text-sm text-ink-soft" style={{ lineHeight: 19 }}>
              {description}
            </Text>
          </View>

          <Animated.View style={{ transform: [{ translateX: arrowX }] }}>
            <Feather name="chevron-right" size={22} color={COLORS.inkMuted} />
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ChooseAddressMethodScreen() {
  const { pickerKey } = useLocalSearchParams<{ pickerKey?: string }>();
  const params = pickerKey ? { pickerKey } : {};

  return (
    <ScreenContainer>
      <ScreenHeader title="Chọn địa chỉ mới" />

      <View className="flex-1 px-5 pt-6" style={{ gap: 16 }}>
        <MethodCard
          icon="map-pin"
          title="Chọn trên bản đồ"
          description="Ghim vị trí, hệ thống tự điền địa chỉ giúp bạn"
          onPress={() =>
            router.push({
              pathname: "/profile/address/select-location",
              params,
            })
          }
        />
        <MethodCard
          icon="edit-3"
          title="Nhập thủ công"
          description="Tự chọn tỉnh/thành, phường/xã và nhập địa chỉ"
          onPress={() =>
            router.push({ pathname: "/profile/address/add", params })
          }
        />
      </View>
    </ScreenContainer>
  );
}
