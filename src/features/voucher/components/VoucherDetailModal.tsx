import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import type { UserVoucher, Voucher } from "@/features/voucher/types/Voucher";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    formatVoucherDate,
    formatVoucherMoney,
    getVoucherDaysLeft,
    voucherSourceLabel,
} from "./VoucherCard";

type Props = {
  visible: boolean;
  voucher: Voucher | null;
  walletVoucher?: UserVoucher;
  isClaiming?: boolean;
  onClose: () => void;
  onClaim?: (code: string) => Promise<boolean>;
};

const distributionLabel: Record<Voucher["distribution_type"], string> = {
  PUBLIC: "Voucher công khai",
  CODE_ONLY: "Nhận bằng mã",
  ASSIGNED: "Được cấp riêng",
};

const lifecycleLabel: Record<Voucher["lifecycle_status"], string> = {
  ACTIVE: "Đang hoạt động",
  UPCOMING: "Sắp diễn ra",
  EXPIRED: "Đã hết hạn",
  EXHAUSTED: "Đã hết lượt nhận",
  DISABLED: "Đã ngừng hoạt động",
};

const walletStatusLabel: Record<UserVoucher["status"], string> = {
  AVAILABLE: "Có thể sử dụng",
  RESERVED: "Đang được giữ cho đơn hàng",
  USED: "Đã sử dụng",
  REVOKED: "Đã thu hồi",
};

type IconName = keyof typeof Feather.glyphMap;

function StatTile({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 16,
        backgroundColor: COLORS.canvas,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.primaryLight,
        }}
      >
        <Feather name={icon} size={14} color={COLORS.primaryDark} />
      </View>
      <Text style={{ marginTop: 8, fontSize: 11, color: COLORS.inkMuted }}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={{
          marginTop: 2,
          fontSize: 14,
          fontWeight: "800",
          color: COLORS.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last,
}: {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.line,
      }}
    >
      <Feather name={icon} size={16} color={COLORS.inkMuted} />
      <Text
        style={{ flex: 1, marginLeft: 12, fontSize: 13, color: COLORS.inkSoft }}
      >
        {label}
      </Text>
      <Text
        style={{
          maxWidth: "55%",
          textAlign: "right",
          fontSize: 13.5,
          fontWeight: "700",
          color: COLORS.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function VoucherDetailModal({
  visible,
  voucher,
  walletVoucher,
  isClaiming,
  onClose,
  onClaim,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!voucher) return null;

  const isPercent = voucher.discount_type === "PERCENT";
  const bigValue = isPercent
    ? `${Number(voucher.discount_value)}%`
    : formatVoucherMoney(voucher.discount_value);
  const daysLeft = getVoucherDaysLeft(voucher.end_at);
  const urgent = daysLeft >= 0 && daysLeft <= 3;

  const rows: { icon: IconName; label: string; value: string }[] = [
    {
      icon: "calendar",
      label: "Hiệu lực",
      value: `${formatVoucherDate(voucher.start_at)} - ${formatVoucherDate(voucher.end_at)}`,
    },
    {
      icon: "send",
      label: "Hình thức phát hành",
      value: distributionLabel[voucher.distribution_type],
    },
    {
      icon: "activity",
      label: "Trạng thái",
      value: walletVoucher
        ? walletStatusLabel[walletVoucher.status]
        : lifecycleLabel[voucher.lifecycle_status],
    },
  ];
  if (voucher.remaining_issuance != null && !walletVoucher) {
    rows.push({
      icon: "users",
      label: "Số lượng còn lại",
      value: `${voucher.remaining_issuance} voucher`,
    });
  }
  if (walletVoucher) {
    rows.push({
      icon: "inbox",
      label: "Nguồn nhận",
      value: voucherSourceLabel[walletVoucher.source],
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: OVERLAY,
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={{
            maxHeight: "90%",
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            overflow: "hidden",
          }}
        >
          <View style={{ alignItems: "center", paddingTop: 10 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.line,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 19,
                fontWeight: "800",
                color: COLORS.ink,
              }}
            >
              Chi tiết voucher
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.canvas,
              }}
            >
              <Feather name="x" size={19} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 20,
                marginBottom: 14,
                overflow: "hidden",
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  right: -36,
                  top: -44,
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  backgroundColor: "rgba(255,255,255,0.12)",
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: -30,
                  bottom: -50,
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              />

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.22)",
                  }}
                >
                  <Feather
                    name={isPercent ? "percent" : "gift"}
                    size={21}
                    color={COLORS.white}
                  />
                </View>
                <Text
                  numberOfLines={2}
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "700",
                    lineHeight: 20,
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  {voucher.name}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "900",
                    color: COLORS.white,
                  }}
                >
                  {bigValue}
                </Text>
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 15,
                    fontWeight: "800",
                    letterSpacing: 2,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  GIẢM
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderStyle: "dashed",
                  borderColor: "rgba(255,255,255,0.55)",
                  backgroundColor: "rgba(255,255,255,0.14)",
                }}
              >
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  Mã voucher
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    letterSpacing: 2.5,
                    color: COLORS.white,
                  }}
                >
                  {voucher.code}
                </Text>
              </View>
            </LinearGradient>

            {urgent && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 14,
                  backgroundColor: COLORS.accentLight,
                }}
              >
                <Feather name="clock" size={15} color={COLORS.accentDark} />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 13,
                    fontWeight: "700",
                    color: COLORS.accentDark,
                  }}
                >
                  {daysLeft === 0
                    ? "Voucher hết hạn hôm nay"
                    : `Voucher sắp hết hạn, còn ${daysLeft} ngày`}
                </Text>
              </View>
            )}

            {/* Điều kiện chính */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <StatTile
                icon="shopping-bag"
                label="Đơn tối thiểu"
                value={formatVoucherMoney(voucher.min_order_amount)}
              />
              <StatTile
                icon="trending-down"
                label="Giảm tối đa"
                value={
                  isPercent && voucher.max_discount_amount
                    ? formatVoucherMoney(voucher.max_discount_amount)
                    : "Không giới hạn"
                }
              />
            </View>

            {!!voucher.description && (
              <View
                style={{
                  padding: 14,
                  marginBottom: 8,
                  borderRadius: 16,
                  backgroundColor: COLORS.canvas,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    letterSpacing: 0.8,
                    color: COLORS.inkSoft,
                  }}
                >
                  MÔ TẢ ƯU ĐÃI
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    lineHeight: 21,
                    color: COLORS.ink,
                  }}
                >
                  {voucher.description}
                </Text>
              </View>
            )}

            <View style={{ paddingHorizontal: 2 }}>
              {rows.map((row, i) => (
                <DetailRow
                  key={row.label}
                  {...row}
                  last={i === rows.length - 1}
                />
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: 12,
                padding: 14,
                borderRadius: 16,
                backgroundColor: COLORS.accentLight,
              }}
            >
              <Feather
                name="info"
                size={16}
                color={COLORS.accentDark}
                style={{ marginTop: 1 }}
              />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 12,
                  lineHeight: 18,
                  color: COLORS.accentDark,
                }}
              >
                Mỗi tài khoản chỉ nhận voucher này một lần. Voucher chỉ áp dụng
                khi đơn hàng đáp ứng đủ điều kiện.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: COLORS.line,
            }}
          >
            {walletVoucher ? (
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  backgroundColor: walletVoucher.is_usable
                    ? COLORS.primaryLight
                    : COLORS.canvas,
                }}
              >
                <Feather
                  name={walletVoucher.is_usable ? "check-circle" : "slash"}
                  size={17}
                  color={
                    walletVoucher.is_usable
                      ? COLORS.primaryDark
                      : COLORS.inkSoft
                  }
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontWeight: "800",
                    color: walletVoucher.is_usable
                      ? COLORS.primaryDark
                      : COLORS.inkSoft,
                  }}
                >
                  {walletVoucher.is_usable
                    ? "Voucher có thể sử dụng"
                    : "Voucher hiện không khả dụng"}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={async () => {
                  const claimed = await onClaim?.(voucher.code);
                  if (claimed) onClose();
                }}
                disabled={isClaiming}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 15,
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: COLORS.primary,
                  opacity: isClaiming ? 0.8 : 1,
                }}
              >
                {isClaiming ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: COLORS.white,
                    }}
                  >
                    Nhận voucher
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
