import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import {
    getUnavailableReason,
    useBookingVoucher,
} from "@/features/voucher/hooks/useBookingVoucher";
import type {
    UserVoucher,
    ValidateVoucherResponse,
} from "@/features/voucher/types/Voucher";
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
} from "./VoucherCard";

type Props = {
  visible: boolean;
  subtotalAmount: number;
  selectedVoucherId?: number | null;
  onClose: () => void;
  onApplied: (
    userVoucher: UserVoucher,
    validation: ValidateVoucherResponse,
  ) => void;
  onClear: () => void;
};

const STRIP = 84;
const NOTCH = 14;

/** Ước tính số tiền giảm (chỉ để hiển thị, số chính thức do server validate). */
const estimateSaving = (item: UserVoucher, subtotal: number) => {
  const v = item.voucher;
  const value = Number(v.discount_value);
  if (v.discount_type === "PERCENT") {
    const raw = (subtotal * value) / 100;
    const cap = v.max_discount_amount
      ? Number(v.max_discount_amount)
      : Number.POSITIVE_INFINITY;
    return Math.min(raw, cap);
  }
  return Math.min(value, subtotal);
};

function Notch({ position }: { position: "top" | "bottom" }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: STRIP - NOTCH / 2,
        [position]: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: NOTCH / 2,
        backgroundColor: COLORS.surface,
      }}
    />
  );
}

function VoucherOption({
  item,
  subtotalAmount,
  selected,
  best,
  onPress,
}: {
  item: UserVoucher;
  subtotalAmount: number;
  selected: boolean;
  best: boolean;
  onPress: () => void;
}) {
  const voucher = item.voucher;
  const unavailableReason = getUnavailableReason(item, subtotalAmount);
  const disabled = unavailableReason !== null;
  const isPercent = voucher.discount_type === "PERCENT";
  const daysLeft = getVoucherDaysLeft(voucher.end_at);
  const urgent = !disabled && daysLeft >= 0 && daysLeft <= 3;
  const saving = estimateSaving(item, subtotalAmount);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={{
        marginBottom: 12,
        borderRadius: 18,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? COLORS.primary : COLORS.line,
        backgroundColor: disabled
          ? COLORS.canvas
          : selected
            ? COLORS.primarySoft
            : COLORS.surface,
        opacity: disabled ? 0.75 : 1,
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Dải giá trị */}
        <LinearGradient
          colors={
            disabled
              ? [COLORS.line, COLORS.line]
              : [COLORS.primary, COLORS.primaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: STRIP,
            paddingVertical: 14,
            paddingHorizontal: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather
            name={isPercent ? "percent" : "gift"}
            size={18}
            color={disabled ? COLORS.inkMuted : COLORS.white}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{
              width: "100%",
              marginTop: 6,
              textAlign: "center",
              fontSize: isPercent ? 20 : 15,
              fontWeight: "800",
              color: disabled ? COLORS.inkSoft : COLORS.white,
            }}
          >
            {isPercent
              ? `${Number(voucher.discount_value)}%`
              : formatVoucherMoney(voucher.discount_value)}
          </Text>
        </LinearGradient>

        {/* Nội dung */}
        <View style={{ flex: 1, padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              {best && !disabled && (
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    marginBottom: 4,
                    borderRadius: 8,
                    backgroundColor: COLORS.accentLight,
                  }}
                >
                  <Feather name="zap" size={10} color={COLORS.accentDark} />
                  <Text
                    style={{
                      marginLeft: 3,
                      fontSize: 10,
                      fontWeight: "800",
                      color: COLORS.accentDark,
                    }}
                  >
                    Tiết kiệm nhất
                  </Text>
                </View>
              )}
              <Text
                numberOfLines={1}
                style={{ fontSize: 14.5, fontWeight: "800", color: COLORS.ink }}
              >
                {voucher.name}
              </Text>
              {!disabled && (
                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    fontWeight: "700",
                    color: COLORS.primaryDark,
                  }}
                >
                  Giảm {formatVoucherMoney(String(Math.round(saving)))} cho đơn
                  này
                </Text>
              )}
            </View>

            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                alignItems: "center",
                justifyContent: "center",
                borderColor: selected ? COLORS.primary : COLORS.line,
                backgroundColor: selected ? COLORS.primary : COLORS.surface,
              }}
            >
              {selected && (
                <Feather name="check" size={14} color={COLORS.white} />
              )}
            </View>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 7,
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.primaryBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 10.5,
                  fontWeight: "800",
                  letterSpacing: 1,
                  color: COLORS.primaryDark,
                }}
              >
                {voucher.code}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginLeft: 8,
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

          <Text style={{ marginTop: 6, fontSize: 11.5, color: COLORS.inkSoft }}>
            Đơn tối thiểu {formatVoucherMoney(voucher.min_order_amount)}
            {isPercent && voucher.max_discount_amount
              ? ` · Tối đa ${formatVoucherMoney(voucher.max_discount_amount)}`
              : ""}
          </Text>

          {unavailableReason && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: COLORS.accentLight,
              }}
            >
              <Feather name="info" size={12} color={COLORS.accentDark} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 6,
                  fontSize: 11.5,
                  color: COLORS.accentDark,
                }}
              >
                {unavailableReason}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Notch position="top" />
      <Notch position="bottom" />
    </TouchableOpacity>
  );
}

function StateBlock({
  icon,
  tint,
  iconColor,
  title,
  subtitle,
  action,
}: {
  icon: keyof typeof Feather.glyphMap;
  tint: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 44,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tint,
        }}
      >
        <Feather name={icon} size={26} color={iconColor} />
      </View>
      <Text
        style={{
          marginTop: 14,
          fontSize: 15,
          fontWeight: "800",
          color: COLORS.ink,
        }}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={{
            marginTop: 4,
            fontSize: 12.5,
            lineHeight: 18,
            textAlign: "center",
            color: COLORS.inkMuted,
          }}
        >
          {subtitle}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={{
            marginTop: 16,
            paddingHorizontal: 22,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: COLORS.primaryLight,
          }}
        >
          <Text style={{ fontWeight: "800", color: COLORS.primaryDark }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function BookingVoucherModal(props: Props) {
  const { visible, subtotalAmount, selectedVoucherId, onClose } = props;
  const b = useBookingVoucher(props);
  const insets = useSafeAreaInsets();

  // Voucher tiết kiệm nhất trong số các voucher dùng được
  const usable = b.sortedVouchers.filter(
    (i) => getUnavailableReason(i, subtotalAmount) === null,
  );
  const bestId =
    usable.length > 1
      ? usable.reduce((a, c) =>
          estimateSaving(c, subtotalAmount) > estimateSaving(a, subtotalAmount)
            ? c
            : a,
        ).id
      : null;

  const pendingItem = b.sortedVouchers.find((i) => i.id === b.pendingVoucherId);
  const pendingSaving = pendingItem
    ? estimateSaving(pendingItem, subtotalAmount)
    : 0;

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
            maxHeight: "88%",
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

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 14,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: COLORS.line,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{ fontSize: 19, fontWeight: "800", color: COLORS.ink }}
              >
                Chọn voucher
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 3,
                }}
              >
                <Feather
                  name="shopping-bag"
                  size={12}
                  color={COLORS.inkMuted}
                />
                <Text
                  style={{
                    marginLeft: 5,
                    fontSize: 12,
                    color: COLORS.inkMuted,
                  }}
                >
                  Giá trị đơn hàng{" "}
                  <Text style={{ fontWeight: "700", color: COLORS.inkSoft }}>
                    {formatVoucherMoney(String(subtotalAmount))}
                  </Text>
                </Text>
              </View>
            </View>
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
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
          >
            {b.isLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 56 }}>
                <ActivityIndicator color={COLORS.primary} />
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: COLORS.inkMuted,
                  }}
                >
                  Đang tải voucher...
                </Text>
              </View>
            ) : b.isError ? (
              <StateBlock
                icon="wifi-off"
                tint={COLORS.dangerLight}
                iconColor={COLORS.danger}
                title="Không thể tải ví voucher"
                subtitle="Kiểm tra kết nối và thử lại nhé."
                action={{ label: "Thử lại", onPress: () => b.refetch() }}
              />
            ) : b.sortedVouchers.length === 0 ? (
              <StateBlock
                icon="inbox"
                tint={COLORS.primaryLight}
                iconColor={COLORS.primaryDark}
                title="Bạn chưa có voucher"
                subtitle="Hãy nhận voucher trong mục Khuyến mãi để sử dụng."
              />
            ) : (
              b.sortedVouchers.map((item) => (
                <VoucherOption
                  key={item.id}
                  item={item}
                  subtotalAmount={subtotalAmount}
                  selected={b.pendingVoucherId === item.id}
                  best={bestId === item.id}
                  onPress={() => b.setPendingVoucherId(item.id)}
                />
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: COLORS.line,
              backgroundColor: COLORS.surface,
            }}
          >
            {pendingItem && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginBottom: 10,
                  borderRadius: 14,
                  backgroundColor: COLORS.primarySoft,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather
                    name="check-circle"
                    size={15}
                    color={COLORS.primaryDark}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 13,
                      color: COLORS.primaryDark,
                    }}
                  >
                    Tiết kiệm ước tính
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: COLORS.primaryDark,
                  }}
                >
                  -{formatVoucherMoney(String(Math.round(pendingSaving)))}
                </Text>
              </View>
            )}

            {selectedVoucherId != null && (
              <TouchableOpacity
                onPress={() => b.setPendingVoucherId(null)}
                disabled={b.isValidating}
                style={{
                  alignItems: "center",
                  paddingVertical: 8,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: COLORS.inkSoft,
                  }}
                >
                  Không sử dụng voucher
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={b.apply}
              disabled={b.blocked}
              activeOpacity={0.85}
              style={{
                paddingVertical: 15,
                alignItems: "center",
                borderRadius: 16,
                backgroundColor: COLORS.primary,
                opacity: b.blocked ? 0.5 : 1,
              }}
            >
              {b.isValidating ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: COLORS.white,
                  }}
                >
                  {b.pendingVoucherId == null
                    ? "Tiếp tục không dùng voucher"
                    : "Áp dụng voucher"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
