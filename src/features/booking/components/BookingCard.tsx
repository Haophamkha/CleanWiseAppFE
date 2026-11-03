import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
import { ServiceThumb } from "@/features/booking/components/ServiceThumb";
import type { BookingListItem } from "@/features/booking/types/Booking";
import { getPaymentStatusMeta } from "@/features/booking/types/bookingStatus";
import { getBookingStatusMap } from "@/features/booking/utils/bookingStatus";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/** Các field backend có thể bổ sung sau; có thì card tự hiện. */
type BookingCardData = BookingListItem & {
  service_icon?: string | null;
  service_code?: string;
  section_code?: string;
  next_schedule_start?: string | null;
  address_summary?: string | null;
  worker_name?: string | null;
  done_sessions?: number;
  total_sessions?: number;
};

const dateText = (iso: string, translateText = defaultTranslate) =>
  new Date(iso).toLocaleDateString(getLocale(translateText), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const dateTimeText = (iso: string, translateText = defaultTranslate) =>
  new Date(iso).toLocaleString(getLocale(translateText), {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function MetaRow({
  icon,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  children: string;
}) {
  const { COLORS } = useAppTheme();

  return (
    <View className="flex-row items-center" style={{ marginTop: 10 }}>
      <View
        className="items-center justify-center bg-surface"
        style={{ width: 26, height: 26, borderRadius: 13 }}
      >
        <Feather name={icon} size={13} color={COLORS.primary} />
      </View>
      <Text
        className="text-ink flex-1"
        style={{ fontSize: 13.5, marginLeft: 10 }}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

export function BookingCard({ item }: { item: BookingCardData }) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const meta = getBookingStatusMap(COLORS, t)[item.status] ?? {
    label: item.status,
    color: COLORS.inkSoft,
    bg: COLORS.line,
  };
  const pay = getPaymentStatusMeta(item.payment_status, COLORS, t);
  const discount = Number(item.discount_amount) || 0;

  const isDead = item.status === "CANCELLED" || item.status === "FAILED";

  const hasProgress = !!item.total_sessions && item.total_sessions > 1;
  const progress = hasProgress
    ? Math.min(1, (item.done_sessions ?? 0) / item.total_sessions!)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="bg-surface border border-line overflow-hidden"
      style={[
        { borderRadius: 26, marginBottom: 16 },
        SHADOWS.card,
        isDead && { opacity: 0.75 },
      ]}
      onPress={() =>
        router.push({
          pathname: "/booking/[id]",
          params: { id: String(item.id) },
        })
      }
    >
      {/* Dải mã đơn */}
      <View
        className="flex-row items-center"
        style={{
          backgroundColor: COLORS.primaryLight,
          paddingHorizontal: 18,
          paddingVertical: 14,
        }}
      >
        <Text
          className="font-bold"
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: COLORS.primaryDark,
            opacity: 0.7,
            marginRight: 10,
          }}
        >
          {t("MÃ ĐƠN")}
        </Text>
        <Text
          selectable
          className="font-extrabold flex-1"
          style={{
            fontSize: 17,
            color: COLORS.primaryDark,
            fontFamily: MONO,
            letterSpacing: 0.8,
          }}
          numberOfLines={1}
        >
          {item.booking_code}
        </Text>
      </View>

      <View style={{ padding: 18 }}>
        {/* Icon + tên dịch vụ + trạng thái */}
        <View className="flex-row items-center">
          <ServiceThumb
            serviceName={item.service_name}
            serviceCode={item.service_code}
            sectionCode={item.section_code}
            iconUri={item.service_icon}
            size={56}
          />
          <View className="flex-1">
            <Text
              className="text-ink font-bold"
              style={{ fontSize: 17, lineHeight: 23 }}
              numberOfLines={2}
            >
              {t(item.service_name)}
            </Text>
            <View
              className="self-start flex-row items-center"
              style={{
                backgroundColor: meta.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                marginTop: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: meta.color,
                  marginRight: 6,
                }}
              />
              <Text
                style={{ fontSize: 11.5, fontWeight: "700", color: meta.color }}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin phụ */}
        <View
          className="bg-canvas"
          style={{
            marginTop: 16,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingTop: 2,
            paddingBottom: 14,
          }}
        >
          <MetaRow icon="calendar">
            {item.next_schedule_start
              ? dateTimeText(item.next_schedule_start, t)
              : t("Đặt ngày {{value0}}", { value0: dateText(item.created_at, t) })}
          </MetaRow>

          {!!item.address_summary && (
            <MetaRow icon="map-pin">{item.address_summary}</MetaRow>
          )}

          {item.worker_name !== undefined && (
            <MetaRow icon="user">
              {item.worker_name || t("Đang tìm nhân viên")}
            </MetaRow>
          )}

          {hasProgress && (
            <View style={{ marginTop: 14 }}>
              <View
                className="flex-row items-center justify-between"
                style={{ marginBottom: 6 }}
              >
                <Text className="text-ink-muted" style={{ fontSize: 11.5 }}>
                  {t("Tiến độ")}
                </Text>
                <Text
                  className="text-ink-soft font-bold"
                  style={{ fontSize: 11.5 }}
                >
                  {item.done_sessions ?? 0}/{item.total_sessions} {t("buổi")}
                </Text>
              </View>
              <View
                className="bg-line overflow-hidden"
                style={{ height: 6, borderRadius: 3 }}
              >
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${progress * 100}%`,
                    backgroundColor: COLORS.primaryFill,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Thanh toán + tổng tiền */}
        <View
          className="flex-row items-end justify-between"
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: COLORS.line,
          }}
        >
          <View className="flex-1" style={{ marginRight: 12 }}>
            {!isDead && (
              <View
                className="self-start flex-row items-center"
                style={{
                  backgroundColor: pay.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Feather name={pay.icon} size={11} color={pay.color} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: pay.color,
                    marginLeft: 4,
                  }}
                >
                  {pay.label}
                </Text>
              </View>
            )}
            {discount > 0 && (
              <Text
                className="text-success"
                style={{ fontSize: 11.5, marginTop: 6 }}
              >
                {t("Tiết kiệm")} {formatVnd(discount, t)}
              </Text>
            )}
          </View>

          <View className="items-end">
            <Text className="text-ink-muted" style={{ fontSize: 11.5 }}>
              {t("Tổng thanh toán")}
            </Text>
            <Text
              className="text-primary font-extrabold"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              {item.total_amount
                ? formatVnd(Number(item.total_amount), t)
                : t("Chờ báo giá")}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
