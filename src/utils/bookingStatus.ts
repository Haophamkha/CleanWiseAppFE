import type { BookingStatus } from "@/types/Booking";

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: {
    label: "Chờ nhận việc",
    color: "#B45309",
    bg: "#FEF3C7",
  },

  ASSIGNED: {
    label: "Đã nhận",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },

  IN_PROGRESS: {
    label: "Đang thực hiện",
    color: "#2563EB",
    bg: "#EFF6FF",
  },

  COMPLETED: {
    label: "Hoàn thành",
    color: "#047857",
    bg: "#D1FAE5",
  },

  CANCELLED: {
    label: "Đã hủy",
    color: "#DC2626",
    bg: "#FEE2E2",
  },

  FAILED: {
    label: "Hết hạn nhận đơn",
    color: "#C2410C",
    bg: "#FFEDD5",
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
  { key: "CANCELLED", label: "Đã  hủy" },
  { key: "FAILED", label: "Hết hạn nhận đơn" },
];
