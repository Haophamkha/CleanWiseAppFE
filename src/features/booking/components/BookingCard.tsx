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
import { Text, TouchableOpacity, View } from "react-native";
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
    <View className="flex-row items-center mt-2">
      <Feather name={icon} size={13} color={COLORS.inkMuted} />
      <Text className="text-ink-soft text-[13px] ml-2 flex-1" numberOfLines={1}>
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
      {/* dải màu theo trạng thái */}
      <View style={{ height: 4, backgroundColor: meta.color }} />

      <View className="p-4">
        {/* Hàng 1: icon + tên + trạng thái */}
        <View className="flex-row items-start">
          <ServiceThumb
            imageUrl={item.service_image}
            serviceName={item.service_name}
            fallbackIcon={icon}
            tint={meta.color}
            bg={meta.bg}
          />

          <View className="flex-1 mr-2">
            <Text className="text-ink font-bold text-[16px]" numberOfLines={2}>
              {item.service_name}
            </Text>
            <Text
              selectable
              className="text-ink-muted text-[11.5px] mt-0.5"
              style={{ letterSpacing: 0.6 }}
              numberOfLines={1}
            >
              #{item.booking_code}
            </Text>
          </View>

          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: meta.bg }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: meta.color }}
            >
              {meta.label}
            </Text>
          </View>
        </View>

        {/* Hàng 2: thông tin phụ */}
        <View className="mt-3 rounded-2xl bg-canvas px-3.5 pt-1 pb-3">
          {item.next_schedule_start ? (
            <MetaRow icon="calendar">
              {dateTimeText(item.next_schedule_start)}
            </MetaRow>
          ) : (
            <MetaRow icon="calendar">{`Đặt ngày ${dateText(item.created_at)}`}</MetaRow>
          )}

          {!!item.address_summary && (
            <MetaRow icon="map-pin">{item.address_summary}</MetaRow>
          )}

          {item.worker_name !== undefined && (
            <MetaRow icon="user">
              {item.worker_name || "Đang tìm nhân viên"}
            </MetaRow>
          )}

          {hasProgress && (
            <View className="mt-3">
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

        {/* Hàng 3: thanh toán + tổng tiền */}
        <View className="flex-row items-end justify-between mt-4">
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

        {/* Nút xem chi tiết */}
        <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-dashed border-line">
          <Text className="text-primary-dark text-[13px] font-bold">
            Xem chi tiết
          </Text>
          <Feather
            name="arrow-right"
            size={14}
            color={COLORS.primaryDark}
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
