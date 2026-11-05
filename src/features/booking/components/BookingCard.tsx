import { ServiceThumb } from "@/features/booking/components/ServiceThumb";
import type { BookingListItem } from "@/features/booking/types/Booking";
import { getPaymentStatusMeta } from "@/features/booking/types/bookingStatus";
import { getBookingStatusMap } from "@/features/booking/utils/bookingStatus";
import {
  translate as defaultTranslate,
  getLocale,
} from "@/features/language/i18n";

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

export function BookingCard({ item }: { item: BookingCardData }) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const meta = getBookingStatusMap(COLORS, t)[item.status] ?? {
    label: item.status,
    color: COLORS.inkSoft,
    bg: COLORS.line,
  };
  const pay = getPaymentStatusMeta(item.payment_status, COLORS, t);

  const isDead = item.status === "CANCELLED" || item.status === "FAILED";

  const hasProgress = !!item.total_sessions && item.total_sessions > 1;
  const progress = hasProgress
    ? Math.min(1, (item.done_sessions ?? 0) / item.total_sessions!)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="bg-surface border border-line overflow-hidden"
      style={[
        { borderRadius: 20, marginBottom: 14 },
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
      <View style={{ padding: 14 }}>
        {/* Vùng 1: icon + tên dịch vụ + trạng thái */}
        <View className="flex-row items-center">
          <ServiceThumb
            serviceName={item.service_name}
            serviceCode={item.service_code}
            sectionCode={item.section_code}
            iconUri={item.service_icon}
            size={48}
          />
          <View className="flex-1">
            <Text
              className="text-ink font-bold"
              style={{ fontSize: 15.5, lineHeight: 21 }}
              numberOfLines={1}
            >
              {t(item.service_name)}
            </Text>
            <View
              className="self-start flex-row items-center"
              style={{
                backgroundColor: meta.bg,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 999,
                marginTop: 5,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: meta.color,
                  marginRight: 5,
                }}
              />
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: meta.color }}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Vùng 2: ngày giờ + mã đơn (khối nền nhạt, 2 cột) */}
        <View
          className="bg-canvas flex-row"
          style={{
            marginTop: 12,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <View className="flex-1" style={{ marginRight: 10 }}>
            <Text
              className="text-ink-muted font-bold"
              style={{ fontSize: 10, letterSpacing: 0.6 }}
            >
              {item.next_schedule_start ? t("LỊCH LÀM") : t("NGÀY ĐẶT")}
            </Text>
            <View className="flex-row items-center" style={{ marginTop: 3 }}>
              <Feather name="calendar" size={12} color={COLORS.primary} />
              <Text
                className="text-ink font-semibold"
                style={{ fontSize: 12.5, marginLeft: 5, flexShrink: 1 }}
                numberOfLines={1}
              >
                {item.next_schedule_start
                  ? dateTimeText(item.next_schedule_start, t)
                  : dateText(item.created_at, t)}
              </Text>
            </View>
          </View>

          <View
            style={{ width: 1, backgroundColor: COLORS.line, marginRight: 12 }}
          />

          <View style={{ flex: 1.15 }}>
            <Text
              className="text-ink-muted font-bold"
              style={{ fontSize: 10, letterSpacing: 0.6 }}
            >
              {t("MÃ ĐƠN")}
            </Text>
            <Text
              selectable
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              className="text-ink font-extrabold"
              style={{
                fontSize: 13,
                marginTop: 3,
                fontFamily: MONO,
                letterSpacing: 0.3,
              }}
            >
              {item.booking_code}
            </Text>
          </View>
        </View>

        {hasProgress && (
          <View style={{ marginTop: 12 }}>
            <View
              className="flex-row items-center justify-between"
              style={{ marginBottom: 5 }}
            >
              <Text className="text-ink-muted" style={{ fontSize: 11 }}>
                {t("Tiến độ")}
              </Text>
              <Text
                className="text-ink-soft font-bold"
                style={{ fontSize: 11 }}
              >
                {item.done_sessions ?? 0}/{item.total_sessions} {t("buổi")}
              </Text>
            </View>
            <View
              className="bg-line overflow-hidden"
              style={{ height: 5, borderRadius: 3 }}
            >
              <View
                style={{
                  height: 5,
                  borderRadius: 3,
                  width: `${progress * 100}%`,
                  backgroundColor: COLORS.primaryFill,
                }}
              />
            </View>
          </View>
        )}

        {/* Vùng 3: thanh toán | tổng tiền */}
        <View
          className="flex-row items-center justify-between"
          style={{ marginTop: 12 }}
        >
          {!isDead ? (
            <View
              className="flex-row items-center"
              style={{
                backgroundColor: pay.bg,
                paddingHorizontal: 9,
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
          ) : (
            <View />
          )}

          <Text
            className="text-primary font-extrabold"
            style={{ fontSize: 19 }}
          >
            {item.total_amount
              ? formatVnd(Number(item.total_amount), t)
              : t("Chờ báo giá")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
