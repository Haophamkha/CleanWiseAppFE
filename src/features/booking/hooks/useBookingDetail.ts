import {
  useCancelBookingMutation,
  useCancelScheduleMutation,
  useGetBookingDetailQuery,
} from "@/features/booking/api/bookingApi";
import type { BookingScheduleDetail } from "@/features/booking/types/Booking";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatVnd } from "@/utils/currency";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const CANCELLABLE_STATUSES = ["PENDING", "ASSIGNED"];
const ACTIVE_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS"];

export function useBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelTarget, setCancelTarget] =
    useState<BookingScheduleDetail | null>(null);

  const {
    data: booking,
    isLoading,
    isError,
  } = useGetBookingDetailQuery(bookingId, {
    skip: !Number.isFinite(bookingId),
  });
  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();
  const [cancelSchedule, { isLoading: isCancellingSchedule }] =
    useCancelScheduleMutation();

  const schedules = booking?.schedules ?? [];
  const isPackage = schedules.length > 1;
  const singleSchedule = schedules[0];
  const hasInProgressSchedule = schedules.some(
    (s) => s.status === "IN_PROGRESS",
  );

  const isCash = booking?.payment?.method === "CASH";
  const isPaid = booking?.payment_status === "PAID";
  // Đã trả trước (chuyển khoản hoặc ví) -> có hoàn tiền vào ví khi hủy
  const isPaidOnline = isPaid && !isCash;
  // Đơn online chưa trả: hủy cả đơn được, hủy từng buổi bị BE chặn
  const isOnlineUnpaid = !!booking && !isCash && !isPaid;

  const isCancellable =
    !!booking &&
    CANCELLABLE_STATUSES.includes(booking.status) &&
    !hasInProgressSchedule;

  // Đơn nhiều buổi đã trả hoặc tiền mặt: chỉ hủy từng buổi, ẩn "Hủy đơn"
  const canCancelBooking = isCancellable && (!isPackage || isOnlineUnpaid);

  const schedulesCancellable =
    isPackage &&
    !!booking &&
    ACTIVE_STATUSES.includes(booking.status) &&
    !isOnlineUnpaid;
  const canCancelSchedule = (s: BookingScheduleDetail) =>
    schedulesCancellable && s.status === "PENDING";

  const confirmCancel = async (reason: string) => {
    if (!booking) return;
    try {
      const res = await cancelBooking({ id: booking.id, reason }).unwrap();
      setCancelVisible(false);
      const refunded = Number(res?.refunded_amount ?? 0);
      Alert.alert(
        "Đã hủy đơn",
        refunded > 0
          ? `Đơn hàng đã được hủy. Đã hoàn ${formatVnd(refunded)} vào ví của bạn.`
          : "Đơn hàng đã được hủy thành công.",
      );
    } catch (err: any) {
      Alert.alert(
        "Không thể hủy đơn",
        getApiErrorMessage(err, "Không thể hủy đơn hàng, vui lòng thử lại."),
      );
    }
  };

  const confirmCancelSchedule = async (reason: string) => {
    if (!booking || !cancelTarget) return;
    try {
      const res = await cancelSchedule({
        scheduleId: cancelTarget.id,
        bookingId: booking.id,
        reason,
      }).unwrap();
      setCancelTarget(null);
      const refunded = Number(res?.refunded_amount ?? 0);
      const lines = [
        res?.booking_status === "CANCELLED"
          ? "Đơn hàng đã được hủy."
          : "Đã hủy buổi làm việc.",
      ];
      if (refunded > 0) {
        lines.push(`Đã hoàn ${formatVnd(refunded)} vào ví của bạn.`);
      }
      Alert.alert("Đã hủy buổi", lines.join(" "));
    } catch (err: any) {
      Alert.alert(
        "Không thể hủy buổi",
        getApiErrorMessage(
          err,
          "Không thể hủy buổi làm việc, vui lòng thử lại.",
        ),
      );
    }
  };

  return {
    booking,
    isLoading,
    isError,
    isPackage,
    singleSchedule,
    canCancelBooking,
    isPaidOnline,
    cancelVisible,
    setCancelVisible,
    isCancelling,
    confirmCancel,
    canCancelSchedule,
    cancelTarget,
    openCancelSchedule: (s: BookingScheduleDetail) => setCancelTarget(s),
    closeCancelSchedule: () => setCancelTarget(null),
    isCancellingSchedule,
    confirmCancelSchedule,
  };
}
