import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";

import type { ThemeColors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

export function getLocalizedProgressSteps(translateText = defaultTranslate): {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] {
  return [
    { key: "PENDING", label: translateText("Chờ nhận việc"), icon: "clock" },
    { key: "ASSIGNED", label: translateText("Đã nhận"), icon: "user-check" },
    { key: "IN_PROGRESS", label: translateText("Đang thực hiện"), icon: "tool" },
    { key: "COMPLETED", label: translateText("Hoàn thành"), icon: "check-circle" },
  ];
}

export const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export function formatDateTime(value: string, translateText = defaultTranslate) {
  return new Date(value).toLocaleString(getLocale(translateText), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Small status pill shown next to the booking code in the header. */
export function getBookingStatusMeta(status: string, COLORS: ThemeColors, translateText = defaultTranslate) {
  switch (status) {
    case "PENDING":
      return { label: translateText("Chờ nhận việc"), color: COLORS.accentDark, bg: COLORS.accentLight };
    case "ASSIGNED":
      return { label: translateText("Đã nhận việc"), color: COLORS.infoDark, bg: COLORS.infoLight };
    case "IN_PROGRESS":
      return { label: translateText("Đang thực hiện"), color: COLORS.success, bg: COLORS.successLight };
    case "COMPLETED":
      return { label: translateText("Hoàn thành"), color: COLORS.success, bg: COLORS.successLight };
    case "CANCELLED":
      return { label: translateText("Đã hủy"), color: COLORS.danger, bg: COLORS.dangerLight };
    case "EXPIRED":
      return { label: translateText("Đã hết hạn"), color: COLORS.accentDark, bg: COLORS.accentLight };
    default:
      return { label: status, color: COLORS.inkSoft, bg: COLORS.surfaceMuted };
  }
}

export function getPaymentStatusMeta(status: string, COLORS: ThemeColors, translateText = defaultTranslate) {
  switch (status) {
    case "SUCCESS":
      return {
        label: translateText("Đã thanh toán"),
        color: COLORS.success,
        bg: COLORS.successLight,
        icon: "check-circle" as const,
      };
    case "REFUNDED":
      return {
        label: translateText("Đã hoàn tiền"),
        color: COLORS.violet,
        bg: COLORS.violetLight,
        icon: "rotate-ccw" as const,
      };
    case "FAILED":
      return {
        label: translateText("Thanh toán thất bại"),
        color: COLORS.danger,
        bg: COLORS.dangerLight,
        icon: "alert-circle" as const,
      };
    case "CANCELLED":
      return {
        label: translateText("Đã hủy thanh toán"),
        color: COLORS.inkSoft,
        bg: COLORS.surfaceMuted,
        icon: "x-circle" as const,
      };
    case "PAID":
      return {
        label: translateText("Đã thanh toán"),
        color: COLORS.success,
        bg: COLORS.successLight,
        icon: "check-circle" as const,
      };
    case "PARTIALLY_REFUNDED":
      return {
        label: translateText("Đã hoàn một phần"),
        color: COLORS.violet,
        bg: COLORS.violetLight,
        icon: "rotate-ccw" as const,
      };
    default:
      return {
        label: translateText("Chưa thanh toán"),
        color: COLORS.accentDark,
        bg: COLORS.accentLight,
        icon: "clock" as const,
      };
  }
}
