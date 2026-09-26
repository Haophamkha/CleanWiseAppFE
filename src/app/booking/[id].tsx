import { BookingBottomBar } from "@/components/booking/BookingBottomBar";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingProgressBar } from "@/components/booking/BookingProgressBar";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { PackageScheduleSection } from "@/components/booking/PackageScheduleSection";
import { ReceiptCard } from "@/components/booking/ReceiptCard";
import { ReviewFeedbackButtons } from "@/components/booking/ReviewFeedbackButtons";
import { ScheduleCard } from "@/components/booking/ScheduleCard";
import { SectionTitle } from "@/components/booking/SectionTitle";
import { ServiceOptionsSummary } from "@/components/booking/ServiceOptionsSummary";
import { SingleScheduleSection } from "@/components/booking/SingleScheduleSection";
import { COLORS } from "@/components/service/formFieldShared";
import {
  useCancelBookingMutation,
  useGetBookingDetailQuery,
} from "@/services/bookingApi";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CANCELLABLE_STATUSES = ["PENDING", "ASSIGNED"];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const insets = useSafeAreaInsets();

  const [cancelVisible, setCancelVisible] = useState(false);

  const {
    data: booking,
    isLoading,
    isError,
  } = useGetBookingDetailQuery(bookingId, {
    skip: !Number.isFinite(bookingId),
  });

  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

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

  const isPackage = booking.schedules.length > 1;
  const singleSchedule = booking.schedules[0];

  const hasInProgressSchedule = booking.schedules.some(
    (s) => s.status === "IN_PROGRESS",
  );

  const isCancellable =
    CANCELLABLE_STATUSES.includes(booking.status) && !hasInProgressSchedule;

  const isPaidOnline =
    booking.payment?.method === "BANK_TRANSFER" &&
    booking.payment_status === "PAID";

  const handleConfirmCancel = async (reason: string) => {
    try {
      await cancelBooking({ id: booking.id, reason }).unwrap();
      setCancelVisible(false);
      Alert.alert(
        "Đã hủy đơn",
        isPaidOnline
          ? "Đơn hàng đã được hủy. Số tiền đã được hoàn vào ví của bạn."
          : "Đơn hàng đã được hủy thành công.",
      );
    } catch (err: any) {
      const message =
        err?.data?.booking ||
        err?.data?.reason?.[0] ||
        err?.data?.message ||
        "Không thể hủy đơn hàng, vui lòng thử lại.";
      Alert.alert("Không thể hủy đơn", String(message));
    }
  };

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
          paddingBottom: isCancellable ? 24 : 24 + insets.bottom,
        }}
      >
        <BookingProgressBar status={booking.status} />

        {isPackage ? (
          <PackageScheduleSection
            schedules={booking.schedules}
            bookingId={booking.id}
            bookingStatus={booking.status}
          />
        ) : (
          <>
            {singleSchedule && (
              <ScheduleCard
                start={singleSchedule.scheduled_start}
                end={singleSchedule.scheduled_end}
              />
            )}
            {singleSchedule && (
              <SingleScheduleSection schedule={singleSchedule} />
            )}
            {singleSchedule?.status === "COMPLETED" && (
              <View className="mb-5">
                <ReviewFeedbackButtons />
              </View>
            )}
          </>
        )}
        <View className="mb-5 bg-white rounded-2xl border border-gray-100 p-4">
          <SectionTitle icon="map-pin">
            {booking.delivery_address ? "Địa chỉ chuyển đi" : "Địa chỉ"}
          </SectionTitle>

          <Text className="text-gray-900 font-semibold text-[15px] mb-1">
            {booking.address.label || "Địa chỉ thực hiện dịch vụ"}
          </Text>
          <Text className="text-gray-500 text-[13px] mb-3">
            {booking.address.address_line}
            {booking.address.ward ? `, ${booking.address.ward}` : ""}
            {`, ${booking.address.city}`}
          </Text>

          <View className="flex-row items-center">
            <Feather name="user" size={14} color="#9CA3AF" />
            <Text className="text-gray-700 text-[13px] ml-2">
              {booking.address.receiver_name} · {booking.address.receiver_phone}
            </Text>
          </View>
        </View>

        {booking.delivery_address && (
          <View className="mb-5 bg-white rounded-2xl border border-gray-100 p-4">
            <SectionTitle icon="map-pin">Địa chỉ chuyển đến</SectionTitle>

            <Text className="text-gray-900 font-semibold text-[15px] mb-1">
              {booking.delivery_address.label || "Địa chỉ chuyển đến"}
            </Text>
            <Text className="text-gray-500 text-[13px] mb-3">
              {booking.delivery_address.address_line}
              {booking.delivery_address.ward
                ? `, ${booking.delivery_address.ward}`
                : ""}
              {`, ${booking.delivery_address.city}`}
            </Text>

            <View className="flex-row items-center">
              <Feather name="user" size={14} color="#9CA3AF" />
              <Text className="text-gray-700 text-[13px] ml-2">
                {booking.delivery_address.receiver_name} ·{" "}
                {booking.delivery_address.receiver_phone}
              </Text>
            </View>
          </View>
        )}

        <View className="mb-5">
          <SectionTitle icon="clipboard">Thanh toán</SectionTitle>

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

      {isCancellable && (
        <BookingBottomBar onCancel={() => setCancelVisible(true)} />
      )}

      <CancelBookingModal
        visible={cancelVisible}
        loading={isCancelling}
        isPaidOnline={isPaidOnline}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleConfirmCancel}
      />
    </View>
  );
}
