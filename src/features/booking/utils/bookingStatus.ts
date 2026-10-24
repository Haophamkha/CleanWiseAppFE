import { translate as t } from "@/features/language/i18n";
import type { ThemeColors } from "@/constants/theme";

import type { BookingStatus } from "@/features/booking/types/Booking";

export function getBookingStatusMap(COLORS: ThemeColors): Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> {
  return {
  PENDING: {
    label: t("Chờ nhận việc"),
    color: COLORS.accentDark,
    bg: COLORS.accentLight,
  },
  ASSIGNED: {
    label: t("Đã nhận"),
    color: COLORS.infoDark,
    bg: COLORS.infoLight,
  },
  IN_PROGRESS: {
    label: t("Đang thực hiện"),
    color: COLORS.primaryDark,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: t("Hoàn thành"),
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: {
    label: t("Đã hủy"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
  FAILED: {
    label: t("Hết hạn nhận đơn"),
    color: COLORS.inkSoft,
    bg: COLORS.line,
  },
};
}

export function getLocalizedBookingStatusTabs(): {
  key: BookingStatus | "ALL";
  label: string;
}[] {
  return [
    { key: "ALL", label: t("Tất cả") },
    { key: "PENDING", label: t("Chờ nhận") },
    { key: "ASSIGNED", label: t("Đã nhận đơn") },
    { key: "IN_PROGRESS", label: t("Đang làm") },
    { key: "COMPLETED", label: t("Hoàn thành") },
    { key: "CANCELLED", label: t("Đã hủy") },
    { key: "FAILED", label: t("Hết hạn nhận đơn") },
  ];
}
