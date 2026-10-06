import { COLORS, SHADOWS } from "@/constants/theme";
import { ServiceThumb } from "@/features/booking/components/ServiceThumb";
import type {
  BookingListItem,
  BookingStatus,
} from "@/features/booking/types/Booking";
import { getPaymentStatusMeta } from "@/features/booking/types/bookingStatus";
import { BOOKING_STATUS_META } from "@/features/booking/utils/bookingStatus";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const STATUS_ICON: Record<BookingStatus, keyof typeof Feather.glyphMap> = {
  PENDING: "clock",
  ASSIGNED: "user-check",
  IN_PROGRESS: "loader",
  COMPLETED: "check-circle",
  CANCELLED: "x-circle",
  FAILED: "alert-triangle",
};

/** Các field backend có thể bổ sung sau; có thì card tự hiện. */
type BookingCardData = BookingListItem & {
  service_image?: string | null;
  service_code?: string;
  next_schedule_start?: string | null;
  address_summary?: string | null;
  worker_name?: string | null;
  done_sessions?: number;
  total_sessions?: number;
};

const dateText = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const dateTimeText = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
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
  return (
    <View className="flex-row items-center mt-2.5">
      <View
        className="items-center justify-center rounded-full bg-surface"
        style={{ width: 24, height: 24 }}
      >
        <Feather name={icon} size={12} color={COLORS.inkSoft} />
      </View>
      <Text className="text-ink text-[13px] ml-2.5 flex-1" numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function BookingCard({ item }: { item: BookingCardData }) {
  const meta = BOOKING_STATUS_META[item.status] ?? {
    label: item.status,
    color: COLORS.inkSoft,
    bg: COLORS.line,
  };
  const icon = STATUS_ICON[item.status] ?? "clipboard";
  const pay = getPaymentStatusMeta(item.payment_status);
  const discount = Number(item.discount_amount) || 0;

  const isDead = item.status === "CANCELLED" || item.status === "FAILED";
  const showPayment = !isDead;

  const hasProgress = !!item.total_sessions && item.total_sessions > 1;
  const progress = hasProgress
    ? Math.min(1, (item.done_sessions ?? 0) / item.total_sessions!)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className="bg-surface rounded-3xl border border-line mb-4 overflow-hidden"
      style={[SHADOWS.card, isDead && { opacity: 0.75 }]}
      onPress={() =>
        router.push({
          pathname: "/booking/[id]",
          params: { id: String(item.id) },
        })
      }
    >
      {/* Hàng 1: MÃ ĐƠN riêng một hàng, không bị cắt */}
      <View
        className="flex-row flex-wrap items-center px-4 py-3"
        style={{ backgroundColor: COLORS.primaryLight }}
      >
        <Text
          className="text-[11px] font-bold mr-2"
          style={{ color: COLORS.primaryDark, opacity: 0.7 }}
        >
          MÃ ĐƠN
        </Text>
        <Text
          selectable
          className="text-[15px] font-extrabold"
          style={{
            color: COLORS.primaryDark,
            fontFamily: MONO,
            letterSpacing: 0.8,
          }}
        >
          {item.booking_code}
        </Text>
      </View>

      <View className="p-4">
        {/* Hàng 2: ảnh + tên dịch vụ + trạng thái bên dưới */}
        <View className="flex-row items-center">
          <ServiceThumb
            imageUrl={item.service_image}
            serviceName={item.service_name}
            fallbackIcon={icon}
            tint={meta.color}
            bg={meta.bg}
          />
          <View className="flex-1">
            <Text className="text-ink font-bold text-[17px]" numberOfLines={2}>
              {item.service_name}
            </Text>
            <View
              className="self-start flex-row items-center px-2.5 py-1 rounded-full mt-1.5"
              style={{ backgroundColor: meta.bg }}
            >
              <View
                className="rounded-full mr-1.5"
                style={{ width: 6, height: 6, backgroundColor: meta.color }}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: meta.color }}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Hàng 3: thông tin phụ */}
        <View className="mt-4 rounded-2xl bg-canvas px-3.5 pt-0.5 pb-3.5">
          <MetaRow icon="calendar">
            {item.next_schedule_start
              ? dateTimeText(item.next_schedule_start)
              : `Đặt ngày ${dateText(item.created_at)}`}
          </MetaRow>

          {!!item.address_summary && (
            <MetaRow icon="map-pin">{item.address_summary}</MetaRow>
          )}

          {item.worker_name !== undefined && (
            <MetaRow icon="user">
              {item.worker_name || "Đang tìm nhân viên"}
            </MetaRow>
          )}

          {hasProgress && (
            <View className="mt-3.5">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[11.5px] text-ink-muted">Tiến độ</Text>
                <Text className="text-[11.5px] font-bold text-ink-soft">
                  {item.done_sessions ?? 0}/{item.total_sessions} buổi
                </Text>
              </View>
              <View className="h-1.5 rounded-full bg-line overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: COLORS.primary,
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Hàng 4: thanh toán + tổng tiền */}
        <View className="flex-row items-end justify-between mt-4 pt-4 border-t border-dashed border-line">
          <View className="flex-1 mr-3">
            {showPayment && (
              <View
                className="self-start flex-row items-center px-2.5 py-1 rounded-full"
                style={{ backgroundColor: pay.bg }}
              >
                <Feather name={pay.icon} size={11} color={pay.color} />
                <Text
                  className="text-[11px] font-bold ml-1"
                  style={{ color: pay.color }}
                >
                  {pay.label}
                </Text>
              </View>
            )}
            {discount > 0 && (
              <Text className="text-[11.5px] text-success mt-1.5">
                Tiết kiệm {formatVnd(discount)}
              </Text>
            )}
          </View>

          <View className="items-end">
            <Text className="text-ink-muted text-[11px]">Tổng thanh toán</Text>
            <Text className="text-primary font-extrabold text-[20px]">
              {item.total_amount
                ? formatVnd(Number(item.total_amount))
                : "Chờ báo giá"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
