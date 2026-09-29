import { COLORS, SHADOWS } from "@/constants/theme";
import type { BookingListItem, BookingStatus } from "@/types/Booking";
import { BOOKING_STATUS_META } from "@/utils/bookingStatus";
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

export function BookingCard({ item }: { item: BookingListItem }) {
  const meta = BOOKING_STATUS_META[item.status] ?? {
    label: item.status,
    color: COLORS.inkSoft,
    bg: COLORS.line,
  };
  const icon = STATUS_ICON[item.status] ?? "clipboard";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-surface rounded-3xl border border-line p-4 mb-3"
      style={SHADOWS.card}
      onPress={() =>
        router.push({
          pathname: "/booking/[id]",
          params: { id: String(item.id) },
        })
      }
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: meta.bg }}
        >
          <Feather name={icon} size={22} color={meta.color} />
        </View>

        <View className="flex-1">
          <Text className="text-ink font-bold text-base" numberOfLines={2}>
            {item.service_name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Feather name="hash" size={12} color={COLORS.inkMuted} />
            <Text className="text-ink-muted text-xs ml-0.5" numberOfLines={1}>
              {item.booking_code}
            </Text>
          </View>
        </View>

        <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
      </View>

      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-dashed border-line">
        <View>
          <View
            className="self-start px-3 py-1 rounded-full"
            style={{ backgroundColor: meta.bg }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: meta.color }}
            >
              {meta.label}
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Feather name="calendar" size={12} color={COLORS.inkMuted} />
            <Text className="text-ink-muted text-xs ml-1.5">
              {new Date(item.created_at).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-ink-muted text-[11px]">Tổng thanh toán</Text>
          <Text className="text-primary font-extrabold text-lg">
            {item.total_amount
              ? formatVnd(Number(item.total_amount))
              : "Chờ báo giá"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
