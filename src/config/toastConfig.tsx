import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import Toast from "react-native-toast-message";

type FeatherName = ComponentProps<typeof Feather>["name"];
type VariantKey = "success" | "error" | "warning" | "info";

type Variant = {
  icon: FeatherName;
  color: string;
  tint: string;
};

const VARIANTS: Record<VariantKey, Variant> = {
  success: { icon: "check", color: COLORS.success, tint: COLORS.successLight },
  error: { icon: "x", color: COLORS.danger, tint: COLORS.dangerLight },
  warning: {
    icon: "alert-triangle",
    color: COLORS.accent,
    tint: COLORS.accentLight,
  },
  info: { icon: "info", color: COLORS.info, tint: COLORS.infoLight },
};

const DEFAULT_DURATION = 4000;

type ToastCardProps = ToastConfigParams<{ duration?: number }> & {
  variant: VariantKey;
};

function ToastCard({ variant, text1, text2, props, hide }: ToastCardProps) {
  const v = VARIANTS[variant];
  const duration = props?.duration ?? DEFAULT_DURATION;

  const progress = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(0)).current;

  // Hiệu ứng xuất hiện: mờ dần + phóng nhẹ
  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // Thanh đếm ngược thời gian tự tắt
  useEffect(() => {
    progress.setValue(1);
    const anim = Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [duration, progress, text1, text2]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const scale = enter.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  return (
    <Animated.View
      className="w-[92%]"
      style={[
        { borderRadius: RADIUS.card, opacity: enter, transform: [{ scale }] },
        SHADOWS.card,
      ]}
    >
      <Pressable
        onPress={() => hide()}
        accessibilityRole="alert"
        className="bg-surface border border-line overflow-hidden"
        style={{ borderRadius: RADIUS.card }}
      >
        <View className="flex-row">
          {/* Dải màu theo loại */}
          <View style={{ width: 5, backgroundColor: v.color }} />

          <View className="flex-1 flex-row items-center px-3.5 py-3.5">
            {/* Icon đặc màu, viền tint tạo chiều sâu */}
            <View
              className="items-center justify-center mr-3"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: v.tint,
              }}
            >
              <View
                className="items-center justify-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: v.color,
                }}
              >
                <Feather name={v.icon} size={16} color={COLORS.white} />
              </View>
            </View>

            <View className="flex-1 pr-2">
              <Text
                className="text-ink text-[15px] font-bold"
                numberOfLines={2}
              >
                {text1}
              </Text>
              {!!text2 && (
                <Text
                  className="text-ink-soft text-[13px] mt-0.5 leading-[18px]"
                  numberOfLines={2}
                >
                  {text2}
                </Text>
              )}
            </View>

            <View
              className="items-center justify-center bg-canvas"
              style={{ width: 28, height: 28, borderRadius: 14 }}
            >
              <Feather name="x" size={14} color={COLORS.inkMuted} />
            </View>
          </View>
        </View>

        {/* Thanh đếm ngược */}
        <View style={{ height: 3, backgroundColor: v.tint }}>
          <Animated.View
            style={{ width: barWidth, height: 3, backgroundColor: v.color }}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const toastConfig: ToastConfig = {
  success: (p) => <ToastCard {...p} variant="success" />,
  error: (p) => <ToastCard {...p} variant="error" />,
  warning: (p) => <ToastCard {...p} variant="warning" />,
  info: (p) => <ToastCard {...p} variant="info" />,
};

export function AppToast() {
  const insets = useSafeAreaInsets();
  return <Toast config={toastConfig} topOffset={insets.top + 8} />;
}
