import {
  translate as defaultTranslate,
  getLocale,
  localizeKnownMessage,
} from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import type { FeatherName } from "@/components/ui/Input";
import {
  useCreateBookingMutation,
  useGetFavoriteWorkerAvailabilityQuery,
} from "@/features/booking/api/bookingApi";
import { useIdempotencyKey } from "@/features/booking/hooks/useIdempotencyKey";
import { clearBookingDraft } from "@/features/booking/stores/bookingDraftSlice";
import type { BookingFavoriteWorker } from "@/features/booking/types/Booking";
import {
  DEFAULT_BOOKING_POLICY,
  getBookingTimeRange,
  isBookingTimeInRange,
} from "@/features/booking/utils/bookingSchedule";
import {
  calculateEstimatedPrice,
  calculateRecurringPrice,
} from "@/features/service/utils/servicePricing";
import type {
  UserVoucher,
  ValidateVoucherResponse,
} from "@/features/voucher/types/Voucher";
import { useGetWalletQuery } from "@/features/wallet/api/walletApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatVnd } from "@/utils/currency";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export type PaymentMethodValue = "CASH" | "BANK_TRANSFER" | "WALLET";
export type PaymentOption = {
  value: PaymentMethodValue;
  label: string;
  icon: string;
  subtitle?: string;
  disabled?: boolean;
};

export function getLocalizedPaymentMethods(
  translateText = defaultTranslate,
): PaymentOption[] {
  return [
    { value: "CASH", label: translateText("Tiền mặt"), icon: "cash" },
    {
      value: "BANK_TRANSFER",
      label: translateText("Chuyển khoản"),
      icon: "bank",
    },
    { value: "WALLET", label: translateText("Ví CleanWise"), icon: "wallet" },
  ];
}

export type ScheduleRow = { icon: FeatherName; text: string; error?: boolean };

const WEEKDAY_LABELS: Record<string, string> = {
  MON: "T2",
  TUE: "T3",
  WED: "T4",
  THU: "T5",
  FRI: "T6",
  SAT: "T7",
  SUN: "CN",
};

function getLocalizedPackageLabels(
  translateText = defaultTranslate,
): Record<string, string> {
  return {
    "1_MONTH": translateText("1 tháng"),
    "2_MONTHS": translateText("2 tháng"),
    "3_MONTHS": translateText("3 tháng"),
    "6_MONTHS": translateText("6 tháng"),
  };
}

function extractDurationHours(
  fields: { key: string; type: string }[],
  values: Record<string, any>,
  defaultDurationHours = 3,
): number {
  const durationField = fields.find(
    (f) => f.key === "duration" && f.type === "SINGLE_SELECT",
  );
  const raw = durationField ? values[durationField.key] : undefined;
  if (typeof raw === "string") {
    const match = raw.match(/^(\d+)_HOURS?$/i);
    if (match) return parseInt(match[1], 10);
  }
  return defaultDurationHours;
}

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatWeekdays = (
  weekdays?: string[],
  translateText = defaultTranslate,
) =>
  !weekdays || weekdays.length === 0
    ? "—"
    : weekdays.map((d) => translateText(WEEKDAY_LABELS[d] ?? d)).join(", ");

const formatTime = (d: Date, translateText = defaultTranslate) =>
  d.toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

export function useBookingConfirm() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.bookingDraft);
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const { data: wallet } = useGetWalletQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const walletBalance = wallet ? Number(wallet.balance) : null;
  const { getKey, resetKey } = useIdempotencyKey();

  const [rawPaymentMethod, setPaymentMethod] =
    useState<PaymentMethodValue>("CASH");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(
    null,
  );
  const [voucherValidation, setVoucherValidation] =
    useState<ValidateVoucherResponse | null>(null);

  const { service, values, addresses } = draft;
  const serviceFields = service?.form_schema?.fields ?? [];

  const isMovingService = service?.form_schema?.address_count === 2;
  const pickupAddress =
    addresses?.pickup_address ?? Object.values(addresses ?? {})[0];
  const deliveryAddress = addresses?.delivery_address;
  const scheduleType: string = service?.form_schema?.schedule_type ?? "ONCE";
  const bookingPolicy = service?.booking_policy ?? DEFAULT_BOOKING_POLICY;
  const user = useAppSelector((s) => s.auth.user);
  const [workerSelection, setPreferredWorker] = useState<BookingFavoriteWorker | null>(
    null,
  );
  const serviceData = useMemo(() => {
    const allowedKeys = new Set(service?.form_schema?.fields.map((f) => f.key));
    return Object.fromEntries(
      Object.entries(values).filter(([key]) => allowedKeys.has(key)),
    );
  }, [service, values]);
  const hasSchedule = scheduleType === "ONCE"
    ? !!(values.date && values.start_time)
    : !!(values.weekdays?.length && values.start_time && values.package_duration);
  const canCheckAvailability = !!(user && service && pickupAddress && hasSchedule);
  const {
    currentData: favoriteData,
    isFetching: favoritesFetching,
    isError: favoritesError,
    isUninitialized: favoritesUninitialized,
    refetch: refetchFavorites,
  } = useGetFavoriteWorkerAvailabilityQuery(
    canCheckAvailability
      ? { service_id: service.id, address_id: pickupAddress.id, service_data: serviceData }
      : skipToken,
    { refetchOnMountOrArgChange: true },
  );
  const favoriteWorkers = favoriteData?.results ?? [];
  const favoritesLoading =
    canCheckAvailability && !favoriteData && (favoritesFetching || favoritesUninitialized);
  const refreshFavoriteWorkers = () => {
    if (!favoritesUninitialized && !favoritesFetching) void refetchFavorites();
  };

  useEffect(() => {
    if (!workerSelection || !favoriteData || favoritesFetching || favoritesError) return;
    const stillAvailable = favoriteData.results.some(
      (worker) =>
        worker.worker_id === workerSelection.worker_id && worker.availability === "AVAILABLE",
    );
    if (!stillAvailable) {
      setPreferredWorker(null);
      Alert.alert(
        t("Nhân viên yêu thích"),
        t("Nhân viên đã bận hoặc không còn phù hợp với lịch bạn chọn. Vui lòng chọn lại."),
      );
    }
  }, [workerSelection, favoriteData, favoritesFetching, favoritesError, t]);

  const availabilitySchedule = useMemo(() => {
    if (!favoriteData) return undefined;
    const start = new Date(favoriteData.first_schedule.scheduled_start);
    const end = new Date(favoriteData.first_schedule.scheduled_end);
    const locale = getLocale(t);
    const timeZone = bookingPolicy.time_zone;
    const time = (date: Date) =>
      date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone });
    const date = start.toLocaleDateString(locale, {
      day: "2-digit", month: "2-digit", year: "numeric", timeZone,
    });
    const timeRange = `${time(start)} – ${time(end)}`;
    return scheduleType === "ONCE"
      ? `${timeRange} · ${date}`
      : `${formatWeekdays(values.weekdays, t)} · ${timeRange} · ${t("{{value0}} buổi", { value0: favoriteData.session_count })}`;
  }, [favoriteData, scheduleType, values.weekdays, bookingPolicy.time_zone, t]);

  // Dịch vụ định kỳ / nhiều buổi: bắt buộc thanh toán trước -> ẩn tiền mặt.
  // (BE vẫn là chốt chặn cuối, FE chỉ ẩn cho khách đỡ chọn nhầm.)
  const prepaidOnly = scheduleType !== "ONCE";

  // Nếu state đang là CASH mà dịch vụ là định kỳ thì coi như CHUYỂN KHOẢN,
  // không cần chờ useEffect nên không bị "nháy" tiền mặt.
  const paymentMethod: PaymentMethodValue =
    prepaidOnly && rawPaymentMethod === "CASH"
      ? "BANK_TRANSFER"
      : rawPaymentMethod;

  const recurringPrice = useMemo(() => {
    if (!service) return null;
    return calculateRecurringPrice(
      service.form_schema.fields,
      service.pricing_config,
      values,
    );
  }, [service, values, t]);

  const estimatedPrice = useMemo(() => {
    if (!service) return null;
    return calculateEstimatedPrice(
      serviceFields,
      service.pricing_config,
      values,
    );
  }, [service, values, t]);

  // Giá trước giảm: gói định kỳ lấy grossSubtotal, dịch vụ 1 lần = estimatedPrice.
  // estimatedPrice đã là giá SAU giảm gói nên totalAmount chỉ trừ thêm voucher.
  const grossPrice = recurringPrice
    ? recurringPrice.grossSubtotal
    : estimatedPrice;
  const packageDiscount = recurringPrice
    ? recurringPrice.grossSubtotal - recurringPrice.subtotal
    : 0;
  const voucherDiscount = voucherValidation
    ? Number(voucherValidation.discount_amount)
    : 0;
  const discountAmount = packageDiscount + voucherDiscount;
  const totalAmount = voucherValidation
    ? Number(voucherValidation.total_amount)
    : estimatedPrice;

  const clearSelectedVoucher = () => {
    setSelectedVoucher(null);
    setVoucherValidation(null);
  };

  const applyVoucher = (
    userVoucher: UserVoucher,
    validation: ValidateVoucherResponse,
  ) => {
    setSelectedVoucher(userVoucher);
    setVoucherValidation(validation);
  };

  useEffect(() => {
    setSelectedVoucher(null);
    setVoucherValidation(null);
  }, [estimatedPrice]);

  const scheduledStart = useMemo(() => {
    if (scheduleType !== "ONCE") return null;
    const date = values.date;
    const time = values.start_time;
    if (!date || !time) return null;
    // Represent the selected wall time in UTC for display. Eligibility uses the booking timezone.
    const parsed = new Date(`${date}T${time}:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [scheduleType, values, t]);

  const durationHours = useMemo(() => {
    return extractDurationHours(serviceFields, values, service?.form_schema?.default_duration_hours);
  }, [service, values, t]);

  const scheduledEnd = useMemo(() => {
    if (!scheduledStart) return null;
    return new Date(scheduledStart.getTime() + durationHours * 60 * 60 * 1000);
  }, [scheduledStart, durationHours, t]);

  // Các dòng "Thời gian làm việc" đã format sẵn, màn hình chỉ việc render
  const scheduleRows = useMemo<ScheduleRow[]>(() => {
    if (scheduleType === "ONCE") {
      if (!scheduledStart || !scheduledEnd) {
        return [
          {
            icon: "calendar",
            text: t("Chưa chọn ngày/giờ ở trang dịch vụ"),
            error: true,
          },
        ];
      }
      const weekday = capitalizeFirst(
        scheduledStart.toLocaleDateString(getLocale(t), { weekday: "long", timeZone: "UTC" }),
      );
      const fullDate = scheduledStart.toLocaleDateString(getLocale(t), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
      return [
        {
          icon: "calendar",
          text: `${weekday}, ${formatTime(scheduledStart, t)} - ${fullDate}`,
        },
        {
          icon: "clock",
          text: t("{{value0}} giờ, {{value1}} đến {{value2}}", {
            value0: durationHours,
            value1: formatTime(scheduledStart, t),
            value2: formatTime(scheduledEnd, t),
          }),
        },
      ];
    }

    const rows: ScheduleRow[] = [];
    if (values.weekdays?.length && values.start_time) {
      rows.push({
        icon: "repeat",
        text: `${formatWeekdays(values.weekdays, t)}, ${values.start_time}`,
      });
    } else {
      rows.push({
        icon: "repeat",
        text: t("Chưa chọn lịch định kỳ ở trang dịch vụ"),
        error: true,
      });
    }
    if (values.package_duration) {
      rows.push({
        icon: "clock",
        text: t("Gói {{value0}}, bắt đầu từ ngày mai", {
          value0:
            getLocalizedPackageLabels(t)[values.package_duration] ??
            values.package_duration,
        }),
      });
    }
    return rows;
  }, [scheduleType, scheduledStart, scheduledEnd, durationHours, values, t]);

  const summaryFields = serviceFields.filter(
    (f) =>
      f.key !== "date" &&
      f.key !== "start_time" &&
      f.key !== "weekdays" &&
      f.key !== "package_duration",
  );

  const paymentOptions = useMemo<PaymentOption[]>(
    () =>
      getLocalizedPaymentMethods(t)
        // Dịch vụ định kỳ: ẩn hẳn tiền mặt
        .filter((m) => !(prepaidOnly && m.value === "CASH"))
        .map((m) => {
          if (m.value !== "WALLET" || walletBalance == null) return m;
          const insufficient =
            totalAmount != null && walletBalance < totalAmount;
          return {
            ...m,
            subtitle: t("Số dư {{value0}}{{value1}}", {
              value0: formatVnd(walletBalance, t),
              value1: insufficient ? t(" · Không đủ") : "",
            }),
            disabled: insufficient,
          };
        }),
    [walletBalance, totalAmount, prepaidOnly, t],
  );

  const selectedPaymentMethod =
    paymentOptions.find((m) => m.value === paymentMethod) ?? paymentOptions[0];

  const confirm = async () => {
    if (!service) return;

    if (!pickupAddress) {
      Alert.alert(
        t("Thiếu địa chỉ"),
        t("Vui lòng quay lại chọn địa chỉ thực hiện dịch vụ."),
      );
      return;
    }
    if (isMovingService && !deliveryAddress) {
      Alert.alert(
        t("Thiếu địa chỉ"),
        t("Vui lòng quay lại chọn địa chỉ chuyển đến."),
      );
      return;
    }

    if (scheduleType === "ONCE") {
      if (!scheduledStart || !scheduledEnd) {
        Alert.alert(
          t("Thiếu thông tin"),
          t("Vui lòng quay lại chọn ngày và giờ làm việc."),
        );
        return;
      }
      if (!isBookingTimeInRange(values.start_time, getBookingTimeRange(values.date, bookingPolicy))) {
        Alert.alert(
          t("Thời gian không hợp lệ"),
          t("Khung giờ đã hết hạn hoặc không hợp lệ. Vui lòng chọn lại ngày giờ."),
        );
        return;
      }
    }

    if (scheduleType === "RECURRING_WEEKLY") {
      if (
        !values.weekdays?.length ||
        !values.start_time ||
        !values.package_duration
      ) {
        Alert.alert(
          t("Thiếu thông tin"),
          t("Vui lòng quay lại chọn lịch làm việc định kỳ."),
        );
        return;
      }
    }

    try {
      const missingFields = serviceFields
        .filter((field) => {
          const value = serviceData[field.key];
          return (
            field.required === true &&
            (value === undefined || value === null || value === "")
          );
        })
        .map((field) => ({ key: field.key, label: t(field.label) }));

      if (missingFields.length > 0) {
        Alert.alert(
          t("Thiếu thông tin"),
          t("Các trường bắt buộc chưa có dữ liệu:\n\n{{value0}}", {
            value0: missingFields
              .map((field) => `• ${field.label} (${field.key})`)
              .join("\n"),
          }),
        );
        return;
      }

      const payload = {
        service_id: service.id,
        address_id: pickupAddress.id,
        delivery_address_id: isMovingService ? deliveryAddress?.id : undefined,
        service_data: serviceData,
        payment_method: paymentMethod, // đã tự đổi sang BANK_TRANSFER nếu là định kỳ
        voucher_code: selectedVoucher?.voucher.code,
        preferred_worker_id: workerSelection?.worker_id,
        note:
          typeof values.note === "string" && values.note.trim()
            ? values.note.trim()
            : undefined,
      };

      const result = await createBooking({
        ...payload,
        idempotencyKey: getKey(),
      } as any).unwrap();
      resetKey();

      if (paymentMethod === "BANK_TRANSFER") {
        router.replace({
          pathname: "/booking/qr" as any,
          params: { bookingId: String(result.id), code: result.booking_code },
        });
      } else {
        dispatch(clearBookingDraft());
        router.replace({
          pathname: "/booking/success",
          params: { code: result.booking_code },
        });
      }
    } catch (err: any) {
      if (err?.data) resetKey(); // lỗi từ BE -> lần sau là ý định mới; lỗi mạng giữ key để retry an toàn

      const voucherError = err?.data?.errors?.voucher_code;
      const paymentError = err?.data?.errors?.payment_method;
      const preferredError = err?.data?.errors?.preferred_worker_id;
      const amountError = err?.data?.errors?.amount ?? err?.data?.amount;
      if (err?.data?.errors?.schedules) {
        Alert.alert(
          t("Thời gian không hợp lệ"),
          t("Khung giờ đã hết hạn hoặc không hợp lệ. Vui lòng chọn lại ngày giờ."),
        );
        return;
      }
      const message =
        voucherError ||
        paymentError ||
        preferredError ||
        amountError ||
        err?.data?.errors?.service_data ||
        err?.data?.service_data?.__extra__ ||
        err?.data?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        t("Đặt lịch thất bại, vui lòng thử lại.");

      if (voucherError) clearSelectedVoucher();
      if (paymentError) setPaymentModalVisible(true);
      if (preferredError) {
        setPreferredWorker(null);
        refreshFavoriteWorkers();
      }
      Alert.alert(
        voucherError
          ? t("Voucher không còn hợp lệ")
          : paymentError
            ? t("Phương thức thanh toán")
            : preferredError
              ? t("Nhân viên yêu thích")
              : amountError
                ? t("Ví không đủ tiền")
                : t("Không thể đặt lịch"),
        preferredError
          ? (Array.isArray(preferredError) ? preferredError : [preferredError])
              .map((detail) => localizeKnownMessage(String(detail), t))
              .join("\n")
          : Array.isArray(message) ? message.join("\n") : String(message),
      );
    }
  };

  return {
    service,
    values,
    isLoading,
    isMovingService,
    pickupAddress,
    deliveryAddress,
    scheduleRows,
    summaryFields,
    recurringPrice,
    estimatedPrice,
    grossPrice,
    discountAmount,
    voucherDiscount,
    totalAmount,
    selectedVoucher,
    voucherValidation,
    voucherModalVisible,
    setVoucherModalVisible,
    applyVoucher,
    clearSelectedVoucher,
    favoriteWorkers,
    favoritesLoading,
    favoritesFetching,
    favoritesError,
    availabilitySchedule,
    refreshFavoriteWorkers,
    selectedWorker: workerSelection,
    setPreferredWorker,
    paymentMethod,
    setPaymentMethod,
    selectedPaymentMethod,
    paymentModalVisible,
    setPaymentModalVisible,
    confirm,
    paymentOptions,
    prepaidOnly,
  };
}
