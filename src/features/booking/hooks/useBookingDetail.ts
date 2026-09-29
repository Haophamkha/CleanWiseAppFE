import {
    useCancelBookingMutation,
    useGetBookingDetailQuery,
} from "@/services/bookingApi";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const CANCELLABLE_STATUSES = ["PENDING", "ASSIGNED"];

export function useBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
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

  const schedules = booking?.schedules ?? [];
  const isPackage = schedules.length > 1;
  const singleSchedule = schedules[0];
  const hasInProgressSchedule = schedules.some(
    (s) => s.status === "IN_PROGRESS",
  );
  const isCancellable =
    !!booking &&
    CANCELLABLE_STATUSES.includes(booking.status) &&
    !hasInProgressSchedule;
  const isPaidOnline =
    booking?.payment?.method === "BANK_TRANSFER" &&
    booking?.payment_status === "PAID";

  const confirmCancel = async (reason: string) => {
    if (!booking) return;
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

  return {
    booking,
    isLoading,
    isError,
    isPackage,
    singleSchedule,
    isCancellable,
    isPaidOnline,
    cancelVisible,
    setCancelVisible,
    isCancelling,
    confirmCancel,
  };
}
