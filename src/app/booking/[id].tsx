import { ServiceOptionsSummary } from "@/components/booking/ServiceOptionsSummary";
import { COLORS } from "@/components/service/formFieldShared";
import { useGetBookingDetailQuery } from "@/services/bookingApi";
import { BOOKING_STATUS_META } from "@/utils/bookingStatus";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);

  const {
    data: booking,
    isLoading,
    isError,
  } = useGetBookingDetailQuery(bookingId, {
    skip: !Number.isFinite(bookingId),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#047857" />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="alert-circle" size={36} color="#DC2626" />
        <Text className="text-gray-900 font-semibold mt-4">
          Không tải được đơn hàng
        </Text>
        <TouchableOpacity
          className="mt-5 bg-emerald-700 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = BOOKING_STATUS_META[booking.status] ?? {
    label: booking.status,
    color: "#374151",
    bg: "#F3F4F6",
  };

  const schedule = booking.schedules[0];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {booking.service_name}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-gray-500 text-sm">#{booking.booking_code}</Text>
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: meta.bg }}
          >
            <Text className="text-xs font-bold" style={{ color: meta.color }}>
              {meta.label}
            </Text>
          </View>
        </View>

        {schedule && (
          <View
            className="rounded-2xl p-4 mb-5"
            style={{
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.primaryBorder,
            }}
          >
            <View className="flex-row items-center">
              <Feather
                name="calendar"
                size={16}
                color={COLORS.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-[14px] font-semibold"
                style={{ color: COLORS.primary }}
              >
                {new Date(schedule.scheduled_start).toLocaleString("vi-VN")}
              </Text>
            </View>
          </View>
        )}

        <Text
          className="font-bold text-[16px] mb-3"
          style={{ color: COLORS.text }}
        >
          Chi tiết công việc
        </Text>
        <ServiceOptionsSummary
          fields={booking.form_schema?.fields ?? []}
          values={booking.service_data}
          pricingConfig={booking.pricing_config}
        />

        {!!booking.note && (
          <View className="mt-4">
            <Text
              className="font-bold text-[16px] mb-2"
              style={{ color: COLORS.text }}
            >
              Ghi chú
            </Text>
            <Text
              className="text-[14px]"
              style={{ color: COLORS.textSecondary }}
            >
              {booking.note}
            </Text>
          </View>
        )}

        <View
          className="mt-6 pt-4"
          style={{ borderTopWidth: 1, borderColor: COLORS.border }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text style={{ color: COLORS.textMuted }}>Giá dịch vụ</Text>
            <Text className="font-bold" style={{ color: COLORS.text }}>
              {booking.subtotal_amount
                ? formatVnd(Number(booking.subtotal_amount))
                : "Chờ báo giá"}
            </Text>
          </View>
          {Number(booking.discount_amount) > 0 && (
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: COLORS.textMuted }}>Giảm giá</Text>
              <Text className="font-bold" style={{ color: COLORS.text }}>
                -{formatVnd(Number(booking.discount_amount))}
              </Text>
            </View>
          )}
          <View
            className="flex-row items-center justify-between pt-2"
            style={{ borderTopWidth: 1, borderColor: COLORS.border }}
          >
            <Text className="font-bold" style={{ color: COLORS.textMuted }}>
              Tổng thanh toán
            </Text>
            <Text
              className="font-extrabold text-[17px]"
              style={{ color: COLORS.primary }}
            >
              {booking.total_amount
                ? formatVnd(Number(booking.total_amount))
                : "Chờ báo giá"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
