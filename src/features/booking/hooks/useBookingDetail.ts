import { useTranslation } from "react-i18next";

import {
  useCancelBookingMutation,
  useCancelScheduleMutation,
  useGetBookingDetailQuery,
} from "@/features/booking/api/bookingApi";
import type { BookingScheduleDetail } from "@/features/booking/types/Booking";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatVnd } from "@/utils/currency";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const CANCELLABLE_STATUSES = ["PENDING", "ASSIGNED"];
const ACTIVE_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS"];

export function useBookingDetail() {
  const { t } = useTranslation();

  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelTarget, setCancelTarget] =
    useState<BookingScheduleDetail | null>(null);

  const [pollMs, setPollMs] = useState(0);

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useGetBookingDetailQuery(bookingId, {
    skip: !Number.isFinite(bookingId),
    refetchOnMountOrArgChange: true, // mở màn là tải lại, không dùng dữ liệu đệm cũ
    pollingInterval: pollMs, // 0 = không polling
  });

  // Đơn còn đang chạy thì tự hỏi lại 15 giây/lần; đơn đã kết thúc thì dừng
  useEffect(() => {
    setPollMs(booking && ACTIVE_STATUSES.includes(booking.status) ? 15000 : 0);
  }, [booking?.status]);

  // Quay lại màn này (từ màn con, hoặc mở app lại) thì tải lại
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
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
        t("Đã hủy đơn"),
        refunded > 0
          ? t("Đơn dịch vụ đã được hủy. Đã hoàn {{value0}} vào ví của bạn.", {
              value0: formatVnd(refunded),
            })
          : t("Đơn dịch vụ đã được hủy thành công."),
      );
    } catch (err: any) {
      Alert.alert(
        t("Không thể hủy đơn"),
        getApiErrorMessage(
          err,
          t("Không thể hủy đơn dịch vụ, vui lòng thử lại."),
        ),
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
          ? t("Đơn dịch vụ đã được hủy.")
          : t("Đã hủy buổi làm việc."),
      ];
      if (refunded > 0) {
        lines.push(
          t("Đã hoàn {{value0}} vào ví của bạn.", {
            value0: formatVnd(refunded),
          }),
        );
      }
      Alert.alert(t("Đã hủy buổi"), lines.join(" "));
    } catch (err: any) {
      Alert.alert(
        t("Không thể hủy buổi"),
        getApiErrorMessage(
          err,
          t("Không thể hủy buổi làm việc, vui lòng thử lại."),
        ),
      );
    }
  };

  return {
    booking,
    refetch,
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
