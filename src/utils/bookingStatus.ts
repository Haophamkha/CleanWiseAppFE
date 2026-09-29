import { COLORS } from "@/constants/theme";
import type { BookingStatus } from "@/types/Booking";

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Chờ nhận việc",
    color: COLORS.accentDark,
    bg: COLORS.accentLight,
  },
  ASSIGNED: {
    label: "Đã nhận",
    color: COLORS.infoDark,
    bg: COLORS.infoLight,
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: COLORS.primaryDark,
    bg: COLORS.primaryLight,
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
  FAILED: {
    label: "Hết hạn nhận đơn",
    color: COLORS.inkSoft,
    bg: COLORS.line,
  },
};

export const BOOKING_STATUS_TABS: {
  key: BookingStatus | "ALL";
  label: string;
}[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ nhận" },
  { key: "ASSIGNED", label: "Đã nhận đơn" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "FAILED", label: "Hết hạn nhận đơn" },
];
