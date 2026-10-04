import type { FeatherName } from "@/components/ui/Input";
import { useCreateBookingMutation } from "@/features/booking/api/bookingApi";
import { useIdempotencyKey } from "@/features/booking/hooks/useIdempotencyKey";
import { clearBookingDraft } from "@/features/booking/stores/bookingDraftSlice";
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

export const PAYMENT_METHODS: PaymentOption[] = [
  { value: "CASH", label: "Tiền mặt", icon: "cash" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản", icon: "bank" },
  { value: "WALLET", label: "Ví CleanWise", icon: "wallet" },
];

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

const PACKAGE_LABELS: Record<string, string> = {
  "1_MONTH": "1 tháng",
  "2_MONTHS": "2 tháng",
  "3_MONTHS": "3 tháng",
  "6_MONTHS": "6 tháng",
};

function extractDurationHours(
  fields: { key: string; type: string }[],
  values: Record<string, any>,
): number {
  const durationField = fields.find(
    (f) => f.key === "duration" && f.type === "SINGLE_SELECT",
  );
  const raw = durationField ? values[durationField.key] : undefined;
  if (typeof raw === "string") {
    const match = raw.match(/^(\d+)_HOURS?$/i);
    if (match) return parseInt(match[1], 10);
  }
  return 2;
}

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatWeekdays = (weekdays?: string[]) =>
  !weekdays || weekdays.length === 0
    ? "—"
    : weekdays.map((d) => WEEKDAY_LABELS[d] ?? d).join(", ");

const formatTime = (d: Date) =>
  d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export function useBookingConfirm() {
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
  }, [service, values]);

  const estimatedPrice = useMemo(() => {
    if (!service) return null;
    return calculateEstimatedPrice(
      serviceFields,
      service.pricing_config,
      values,
    );
  }, [service, values]);

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
    const parsed = new Date(`${date}T${time}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [scheduleType, values]);

  const durationHours = useMemo(() => {
    if (!service) return 2;
    return extractDurationHours(serviceFields, values);
  }, [service, values]);

  const scheduledEnd = useMemo(() => {
    if (!scheduledStart) return null;
    return new Date(scheduledStart.getTime() + durationHours * 60 * 60 * 1000);
  }, [scheduledStart, durationHours]);

  // Các dòng "Thời gian làm việc" đã format sẵn, màn hình chỉ việc render
  const scheduleRows = useMemo<ScheduleRow[]>(() => {
    if (scheduleType === "ONCE") {
      if (!scheduledStart || !scheduledEnd) {
        return [
          {
            icon: "calendar",
            text: "Chưa chọn ngày/giờ ở trang dịch vụ",
            error: true,
          },
        ];
      }
      const weekday = capitalizeFirst(
        scheduledStart.toLocaleDateString("vi-VN", { weekday: "long" }),
      );
      const fullDate = scheduledStart.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return [
        {
          icon: "calendar",
          text: `${weekday}, ${formatTime(scheduledStart)} - ${fullDate}`,
        },
        {
          icon: "clock",
          text: `${durationHours} giờ, ${formatTime(scheduledStart)} đến ${formatTime(scheduledEnd)}`,
        },
      ];
    }

    const rows: ScheduleRow[] = [];
    if (values.weekdays?.length && values.start_time) {
      rows.push({
        icon: "repeat",
        text: `${formatWeekdays(values.weekdays)}, ${values.start_time}`,
      });
    } else {
      rows.push({
        icon: "repeat",
        text: "Chưa chọn lịch định kỳ ở trang dịch vụ",
        error: true,
      });
    }
    if (values.package_duration) {
      rows.push({
        icon: "clock",
        text: `Gói ${PACKAGE_LABELS[values.package_duration] ?? values.package_duration}, bắt đầu từ ngày mai`,
      });
    }
    return rows;
  }, [scheduleType, scheduledStart, scheduledEnd, durationHours, values]);

  const summaryFields = serviceFields.filter(
    (f) =>
      f.key !== "date" &&
      f.key !== "start_time" &&
      f.key !== "weekdays" &&
      f.key !== "package_duration",
  );

  const paymentOptions = useMemo<PaymentOption[]>(
    () =>
      PAYMENT_METHODS
        // Dịch vụ định kỳ: ẩn hẳn tiền mặt
        .filter((m) => !(prepaidOnly && m.value === "CASH"))
        .map((m) => {
          if (m.value !== "WALLET" || walletBalance == null) return m;
          const insufficient =
            totalAmount != null && walletBalance < totalAmount;
          return {
            ...m,
            subtitle: `Số dư ${formatVnd(walletBalance)}${
              insufficient ? " · Không đủ" : ""
            }`,
            disabled: insufficient,
          };
        }),
    [walletBalance, totalAmount, prepaidOnly],
  );

  const selectedPaymentMethod =
    paymentOptions.find((m) => m.value === paymentMethod) ?? paymentOptions[0];

  const buildServiceData = () => {
    const allowedKeys = new Set(serviceFields.map((f) => f.key));
    return Object.fromEntries(
      Object.entries(values).filter(([k]) => allowedKeys.has(k)),
    );
  };

  const confirm = async () => {
    if (!service) return;

    if (!pickupAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng quay lại chọn địa chỉ thực hiện dịch vụ.",
      );
      return;
    }
    if (isMovingService && !deliveryAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng quay lại chọn địa chỉ chuyển đến.",
      );
      return;
    }

    if (scheduleType === "ONCE") {
      if (!scheduledStart || !scheduledEnd) {
        Alert.alert(
          "Thiếu thông tin",
          "Vui lòng quay lại chọn ngày và giờ làm việc.",
        );
        return;
      }
      if (scheduledStart.getTime() <= Date.now()) {
        Alert.alert("Thời gian không hợp lệ", "Giờ bắt đầu phải ở tương lai.");
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
          "Thiếu thông tin",
          "Vui lòng quay lại chọn lịch làm việc định kỳ.",
        );
        return;
      }
    }

    try {
      const serviceData = buildServiceData();

      const missingFields = serviceFields
        .filter((field) => {
          const value = serviceData[field.key];
          return (
            field.required === true &&
            (value === undefined || value === null || value === "")
          );
        })
        .map((field) => ({ key: field.key, label: field.label }));

      if (missingFields.length > 0) {
        Alert.alert(
          "Thiếu thông tin",
          `Các trường bắt buộc chưa có dữ liệu:\n\n${missingFields
            .map((field) => `• ${field.label} (${field.key})`)
            .join("\n")}`,
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
      const amountError = err?.data?.errors?.amount ?? err?.data?.amount;
      const message =
        voucherError ||
        paymentError ||
        amountError ||
        err?.data?.errors?.service_data ||
        err?.data?.service_data?.__extra__ ||
        err?.data?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        "Đặt lịch thất bại, vui lòng thử lại.";

      if (voucherError) clearSelectedVoucher();
      if (paymentError) setPaymentModalVisible(true);
      Alert.alert(
        voucherError
          ? "Voucher không còn hợp lệ"
          : paymentError
            ? "Phương thức thanh toán"
            : amountError
              ? "Ví không đủ tiền"
              : "Không thể đặt lịch",
        Array.isArray(message) ? message.join("\n") : String(message),
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
