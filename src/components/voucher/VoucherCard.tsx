import { COLORS, SHADOWS } from "@/constants/theme";
import type { UserVoucher, Voucher } from "@/types/Voucher";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  voucher: Voucher;
  walletVoucher?: UserVoucher;
  onClaim?: (code: string) => void;
  onPress?: () => void;
  isClaiming?: boolean;
};

export const formatVoucherMoney = (value?: string | null) => {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

export const formatVoucherDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Số ngày còn lại tới hạn (làm tròn lên). */
export const getVoucherDaysLeft = (value: string) =>
  Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);

export const voucherSourceLabel: Record<UserVoucher["source"], string> = {
  PUBLIC: "Voucher công khai",
  CODE: "Nhận bằng mã",
  ADMIN: "Được tặng riêng",
  CAMPAIGN: "Quà từ chiến dịch",
};

const getWalletStatus = (item: UserVoucher) => {
  if (item.is_usable) {
    return {
      label: "Có thể dùng",
      color: COLORS.primaryDark,
      bg: COLORS.primaryLight,
    };
  }
  if (item.status === "USED") {
    return { label: "Đã sử dụng", color: COLORS.inkSoft, bg: COLORS.canvas };
  }
  if (item.status === "RESERVED") {
    return {
      label: "Đang được giữ",
      color: COLORS.accentDark,
      bg: COLORS.accentLight,
    };
  }
  if (item.status === "REVOKED") {
    return {
      label: "Đã thu hồi",
      color: COLORS.danger,
      bg: COLORS.dangerLight,
    };
  }
  if (item.voucher.lifecycle_status === "EXPIRED") {
    return { label: "Đã hết hạn", color: COLORS.inkSoft, bg: COLORS.canvas };
  }
  return { label: "Không khả dụng", color: COLORS.inkSoft, bg: COLORS.canvas };
};

const LEFT = 104;
const NOTCH = 18;

/** Nửa hình tròn khuyết ở mép thẻ (card có overflow hidden nên chỉ lộ nửa trong). */
function Notch({ side }: { side: "left" | "right" }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        [side]: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: NOTCH / 2,
        backgroundColor: COLORS.canvas,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.line,
      }}
    />
  );
}

function DashedLine() {
  // Mẹo: bọc trong view cao 1px + overflow hidden để dashed hiển thị đúng trên Android
  return (
    <View style={{ flex: 1, height: 1, overflow: "hidden" }}>
      <View
        style={{
          height: 2,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: COLORS.line,
        }}
      />
    </View>
  );
}

export function VoucherCard({
  voucher,
  walletVoucher,
  onClaim,
  onPress,
  isClaiming,
}: Props) {
  const isPercent = voucher.discount_type === "PERCENT";
  const status = walletVoucher ? getWalletStatus(walletVoucher) : null;
  const dimmed = !!walletVoucher && !walletVoucher.is_usable;
  const daysLeft = getVoucherDaysLeft(voucher.end_at);
  const urgent = !dimmed && daysLeft <= 3 && daysLeft >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[
        {
          marginBottom: 16,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
          overflow: "hidden",
          opacity: dimmed ? 0.7 : 1,
        },
        SHADOWS.card,
      ]}
    >
      {/* ── Phần trên ── */}
      <View style={{ flexDirection: "row" }}>
        <LinearGradient
          colors={
            dimmed
              ? [COLORS.inkMuted, COLORS.inkSoft]
              : [COLORS.primary, COLORS.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: LEFT,
            paddingVertical: 18,
            paddingHorizontal: 8,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* vòng tròn trang trí */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -24,
              bottom: -28,
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          >
            <Feather
              name={isPercent ? "percent" : "gift"}
              size={19}
              color={COLORS.white}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{
              width: "100%",
              marginTop: 10,
              textAlign: "center",
              fontSize: isPercent ? 26 : 19,
              fontWeight: "800",
              color: COLORS.white,
            }}
          >
            {isPercent
              ? `${Number(voucher.discount_value)}%`
              : formatVoucherMoney(voucher.discount_value)}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            GIẢM
          </Text>
        </LinearGradient>

        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                paddingRight: 8,
                fontSize: 15,
                lineHeight: 20,
                fontWeight: "800",
                color: COLORS.ink,
              }}
            >
              {voucher.name}
            </Text>
            {status && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: status.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: status.color,
                  }}
                >
                  {status.label}
                </Text>
              </View>
            )}
          </View>

          {!!voucher.description && (
            <Text
              numberOfLines={2}
              style={{
                marginTop: 4,
                fontSize: 12.5,
                lineHeight: 18,
                color: COLORS.inkSoft,
              }}
            >
              {voucher.description}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.primaryBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                  color: COLORS.primaryDark,
                }}
              >
                {voucher.code}
              </Text>
            </View>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <Feather
              name="clock"
              size={12}
              color={urgent ? COLORS.accentDark : COLORS.inkMuted}
            />
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginLeft: 5,
                fontSize: 11,
                fontWeight: urgent ? "700" : "400",
                color: urgent ? COLORS.accentDark : COLORS.inkMuted,
              }}
            >
              {urgent
                ? daysLeft === 0
                  ? "Hết hạn hôm nay"
                  : `Còn ${daysLeft} ngày`
                : `HSD ${formatVoucherDate(voucher.end_at)}`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Đường cắt vé + 2 khuyết tròn ── */}
      <View
        pointerEvents="none"
        style={{
          height: NOTCH,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: NOTCH,
        }}
      >
        <DashedLine />
        <Notch side="left" />
        <Notch side="right" />
      </View>

      {/* ── Chân thẻ ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingTop: 2,
          paddingBottom: 14,
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="shopping-bag" size={13} color={COLORS.inkSoft} />
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginLeft: 6,
                fontSize: 12,
                color: COLORS.inkSoft,
              }}
            >
              Đơn từ {formatVoucherMoney(voucher.min_order_amount)}
            </Text>
          </View>
          {isPercent && !!voucher.max_discount_amount && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Feather name="trending-down" size={13} color={COLORS.inkMuted} />
              <Text
                style={{ marginLeft: 6, fontSize: 11, color: COLORS.inkMuted }}
              >
                Giảm tối đa {formatVoucherMoney(voucher.max_discount_amount)}
              </Text>
            </View>
          )}
        </View>

        {walletVoucher ? (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: COLORS.canvas,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: "600", color: COLORS.inkSoft }}
            >
              {voucherSourceLabel[walletVoucher.source]}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation();
              onClaim?.(voucher.code);
            }}
            disabled={isClaiming}
            activeOpacity={0.8}
            style={{
              minWidth: 96,
              paddingVertical: 10,
              alignItems: "center",
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              opacity: isClaiming ? 0.8 : 1,
            }}
          >
            {isClaiming ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text
                style={{ fontSize: 13, fontWeight: "800", color: COLORS.white }}
              >
                Nhận ngay
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
