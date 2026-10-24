import { translate as t, getLocale } from "@/features/language/i18n";
import type { ThemeColors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

export function getLocalizedProgressSteps(): {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] {
  return [
    { key: "PENDING", label: t("Chờ nhận việc"), icon: "clock" },
    { key: "ASSIGNED", label: t("Đã nhận"), icon: "user-check" },
    { key: "IN_PROGRESS", label: t("Đang thực hiện"), icon: "tool" },
    { key: "COMPLETED", label: t("Hoàn thành"), icon: "check-circle" },
  ];
}

export const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Small status pill shown next to the booking code in the header. */
export function getBookingStatusMeta(status: string, COLORS: ThemeColors) {
  switch (status) {
    case "PENDING":
      return { label: t("Chờ nhận việc"), color: COLORS.accentDark, bg: COLORS.accentLight };
    case "ASSIGNED":
      return { label: t("Đã nhận việc"), color: COLORS.infoDark, bg: COLORS.infoLight };
    case "IN_PROGRESS":
      return { label: t("Đang thực hiện"), color: COLORS.success, bg: COLORS.successLight };
    case "COMPLETED":
      return { label: t("Hoàn thành"), color: COLORS.success, bg: COLORS.successLight };
    case "CANCELLED":
      return { label: t("Đã hủy"), color: COLORS.danger, bg: COLORS.dangerLight };
    case "EXPIRED":
      return { label: t("Đã hết hạn"), color: COLORS.accentDark, bg: COLORS.accentLight };
    default:
      return { label: status, color: COLORS.inkSoft, bg: COLORS.surfaceMuted };
  }
}

export function getPaymentStatusMeta(status: string, COLORS: ThemeColors) {
  switch (status) {
    case "SUCCESS":
      return {
        label: t("Đã thanh toán"),
        color: COLORS.success,
        bg: COLORS.successLight,
        icon: "check-circle" as const,
      };
    case "REFUNDED":
      return {
        label: t("Đã hoàn tiền"),
        color: COLORS.violet,
        bg: COLORS.violetLight,
        icon: "rotate-ccw" as const,
      };
    case "FAILED":
      return {
        label: t("Thanh toán thất bại"),
        color: COLORS.danger,
        bg: COLORS.dangerLight,
        icon: "alert-circle" as const,
      };
    case "CANCELLED":
      return {
        label: t("Đã hủy thanh toán"),
        color: COLORS.inkSoft,
        bg: COLORS.surfaceMuted,
        icon: "x-circle" as const,
      };
    case "PAID":
      return {
        label: t("Đã thanh toán"),
        color: COLORS.success,
        bg: COLORS.successLight,
        icon: "check-circle" as const,
      };
    case "PARTIALLY_REFUNDED":
      return {
        label: t("Đã hoàn một phần"),
        color: COLORS.violet,
        bg: COLORS.violetLight,
        icon: "rotate-ccw" as const,
      };
    default:
      return {
        label: t("Chưa thanh toán"),
        color: COLORS.accentDark,
        bg: COLORS.accentLight,
        icon: "clock" as const,
      };
  }
}
