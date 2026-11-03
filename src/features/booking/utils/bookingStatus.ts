import { translate as defaultTranslate } from "@/features/language/i18n";

import type { ThemeColors } from "@/constants/theme";

import type { BookingStatus } from "@/features/booking/types/Booking";

export function getBookingStatusMap(COLORS: ThemeColors, translateText = defaultTranslate): Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> {
  return {
  PENDING: {
    label: translateText("Chờ nhận việc"),
    color: COLORS.accentDark,
    bg: COLORS.accentLight,
  },
  ASSIGNED: {
    label: translateText("Đã nhận"),
    color: COLORS.infoDark,
    bg: COLORS.infoLight,
  },
  IN_PROGRESS: {
    label: translateText("Đang thực hiện"),
    color: COLORS.primaryDark,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: translateText("Hoàn thành"),
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: {
    label: translateText("Đã hủy"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
  FAILED: {
    label: translateText("Hết hạn nhận đơn"),
    color: COLORS.inkSoft,
    bg: COLORS.line,
  },
};
}

export function getLocalizedBookingStatusTabs(translateText = defaultTranslate): {
  key: BookingStatus | "ALL";
  label: string;
}[] {
  return [
    { key: "ALL", label: translateText("Tất cả") },
    { key: "PENDING", label: translateText("Chờ nhận") },
    { key: "ASSIGNED", label: translateText("Đã nhận đơn") },
    { key: "IN_PROGRESS", label: translateText("Đang làm") },
    { key: "COMPLETED", label: translateText("Hoàn thành") },
    { key: "CANCELLED", label: translateText("Đã hủy") },
    { key: "FAILED", label: translateText("Hết hạn nhận đơn") },
  ];
}
