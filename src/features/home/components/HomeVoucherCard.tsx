import { COLORS, GRADIENTS, ON_DARK, SHADOWS } from "@/constants/theme";
import type { Voucher } from "@/features/voucher/types/Voucher";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const CARD_W = 316;
const STUB_W = 108;
const NOTCH = 20;

const trimNum = (n: number) => String(+n.toFixed(1)).replace(".", ",");

// 50000 -> 50K, 1500000 -> 1,5Tr
const compactMoney = (v: string | number) => {
  const n = Number(v);
  if (n >= 1_000_000) return `${trimNum(n / 1_000_000)}Tr`;
  if (n >= 1_000) return `${trimNum(n / 1_000)}K`;
  return String(n);
};

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const expiry = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (ms > 0 && days <= 3) return { text: `Còn ${days} ngày`, urgent: true };
  return { text: `HSD ${shortDate(iso)}`, urgent: false };
};

export function HomeVoucherCard({
  voucher,
  onPress,
}: {
  voucher: Voucher;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPercent = voucher.discount_type === "PERCENT";
  const value = isPercent
    ? `${Number(voucher.discount_value)}%`
    : compactMoney(voucher.discount_value);

  const parts: string[] = [
    Number(voucher.min_order_amount) > 0
      ? `Đơn từ ${compactMoney(voucher.min_order_amount)}`
      : "Áp dụng mọi đơn",
  ];
  if (isPercent && Number(voucher.max_discount_amount) > 0) {
    parts.push(`Tối đa ${compactMoney(voucher.max_discount_amount!)}`);
  }
  const condition = parts.join(" · ");

  const exp = expiry(voucher.end_at);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
    >
      <Animated.View
        style={[
          {
            width: CARD_W,
            marginRight: 14,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
          },
          SHADOWS.card,
          animatedStyle,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            minHeight: 128,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* ===== Stub trái ===== */}
          <LinearGradient
            colors={GRADIENTS.wallet}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: STUB_W,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 8,
              overflow: "hidden",
            }}
          >
            {/* Vòng tròn trang trí */}
            <View
              style={{
                position: "absolute",
                top: -34,
                left: -34,
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(255,255,255,0.14)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -40,
                right: -30,
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: "rgba(255,255,255,0.09)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 38,
                right: 10,
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            />

            {/* Icon */}
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.24)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.35)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name={isPercent ? "pricetag" : "gift"}
                size={16}
                color={ON_DARK.text}
              />
            </View>

            <Text
              style={{
                color: ON_DARK.textSoft,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 2.5,
              }}
            >
              GIẢM
            </Text>
            <Text
              style={{
                color: ON_DARK.text,
                fontSize: 32,
                fontWeight: "900",
                marginTop: 1,
                letterSpacing: -0.5,
                textShadowColor: "rgba(0,0,0,0.22)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Text>
          </LinearGradient>

          {/* Đường đục lỗ */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: STUB_W - 1.5,
              top: NOTCH,
              bottom: NOTCH,
              width: 3,
              justifyContent: "space-between",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 3,
                  height: 5,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.75)",
                }}
              />
            ))}
          </View>

          {/* Hai nửa vòng khuyết */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -NOTCH / 2,
              left: STUB_W - NOTCH / 2,
              width: NOTCH,
              height: NOTCH,
              borderRadius: NOTCH / 2,
              backgroundColor: COLORS.canvas,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -NOTCH / 2,
              left: STUB_W - NOTCH / 2,
              width: NOTCH,
              height: NOTCH,
              borderRadius: NOTCH / 2,
              backgroundColor: COLORS.canvas,
            }}
          />

          {/* ===== Nội dung phải ===== */}
          <View
            style={{
              flex: 1,
              paddingTop: 14,
              paddingBottom: 12,
              paddingLeft: 20,
              paddingRight: 12,
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                className="text-[15px] font-extrabold text-ink"
                numberOfLines={1}
              >
                {voucher.name}
              </Text>

              <Text className="text-xs text-ink-soft mt-1" numberOfLines={1}>
                {condition}
              </Text>

              <View className="flex-row items-center mt-1.5">
                <Ionicons
                  name={exp.urgent ? "flame" : "time-outline"}
                  size={12}
                  color={exp.urgent ? COLORS.danger : COLORS.inkMuted}
                />
                <Text
                  className="text-[11px] font-semibold ml-1"
                  style={{
                    color: exp.urgent ? COLORS.danger : COLORS.inkMuted,
                  }}
                >
                  {exp.text}
                </Text>
              </View>
            </View>

            {/* Footer: mã + CTA */}
            <View className="flex-row items-center justify-between mt-3">
              <View
                className="flex-row items-center bg-primary-soft border border-primary-border rounded-lg px-2 py-1.5"
                style={{ borderStyle: "dashed" }}
              >
                <Text
                  className="text-[11px] font-extrabold text-primary-dark"
                  style={{ letterSpacing: 0.8 }}
                >
                  {voucher.code}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={11}
                  color={COLORS.inkMuted}
                  style={{ marginLeft: 5 }}
                />
              </View>

              <LinearGradient
                colors={GRADIENTS.wallet}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 11,
                  paddingVertical: 7,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: ON_DARK.text,
                    fontSize: 11,
                    fontWeight: "800",
                  }}
                >
                  Dùng ngay
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={12}
                  color={ON_DARK.text}
                  style={{ marginLeft: 2 }}
                />
              </LinearGradient>
            </View>
          </View>

          {/* Badge sắp hết hạn */}
          {exp.urgent && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: COLORS.danger,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderBottomLeftRadius: 12,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: "800",
                  letterSpacing: 0.5,
                }}
              >
                SẮP HẾT HẠN
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
