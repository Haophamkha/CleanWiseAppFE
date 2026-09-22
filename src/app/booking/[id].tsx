import { BookingBottomBar } from "@/components/booking/BookingBottomBar";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingProgressBar } from "@/components/booking/BookingProgressBar";
import { ReceiptCard } from "@/components/booking/ReceiptCard";
import { ScheduleCard } from "@/components/booking/ScheduleCard";
import { SectionTitle } from "@/components/booking/SectionTitle";
import { ServiceOptionsSummary } from "@/components/booking/ServiceOptionsSummary";
import { WorkerSection } from "@/components/booking/WorkerSection";
import { COLORS } from "@/components/service/formFieldShared";
import { useGetBookingDetailQuery } from "@/services/bookingApi";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const insets = useSafeAreaInsets();

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

  const schedule = booking.schedules[0];
  const showBottomBar = booking.status === "PENDING";

  return (
    <View className="flex-1 bg-white">
      <BookingHeader
        serviceName={booking.service_name}
        bookingCode={booking.booking_code}
        status={booking.status}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: showBottomBar ? 24 : 24 + insets.bottom,
        }}
      >
        <BookingProgressBar status={booking.status} />

        {schedule && (
          <ScheduleCard
            start={schedule.scheduled_start}
            end={schedule.scheduled_end}
          />
        )}

        <WorkerSection schedules={booking.schedules} />

        {/* Chi tiết công việc */}
        <View className="mb-5">
          <SectionTitle icon="clipboard">Chi tiết công việc</SectionTitle>

          <ServiceOptionsSummary
            fields={booking.form_schema?.fields ?? []}
            values={booking.service_data}
            pricingConfig={booking.pricing_config}
          />
        </View>

        {/* Thanh toán */}
        <ReceiptCard booking={booking} />

        {!!booking.note && (
          <View className="mb-2">
            <SectionTitle icon="file-text">Ghi chú</SectionTitle>

            <Text
              className="text-[14px]"
              style={{ color: COLORS.textSecondary }}
            >
              {booking.note}
            </Text>
          </View>
        )}
      </ScrollView>

      {showBottomBar && <BookingBottomBar />}
    </View>
  );
}
