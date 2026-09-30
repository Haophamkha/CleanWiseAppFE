import { Feather } from "@expo/vector-icons";

export const PROGRESS_STEPS: {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "PENDING", label: "Chờ nhận việc", icon: "clock" },
  { key: "ASSIGNED", label: "Đã nhận", icon: "user-check" },
  { key: "IN_PROGRESS", label: "Đang thực hiện", icon: "tool" },
  { key: "COMPLETED", label: "Hoàn thành", icon: "check-circle" },
];

export const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Small status pill shown next to the booking code in the header. */
export function getBookingStatusMeta(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Chờ nhận việc", color: "#B45309", bg: "#FEF3C7" };
    case "ASSIGNED":
      return { label: "Đã nhận việc", color: "#1D4ED8", bg: "#DBEAFE" };
    case "IN_PROGRESS":
      return { label: "Đang thực hiện", color: "#047857", bg: "#D1FAE5" };
    case "COMPLETED":
      return { label: "Hoàn thành", color: "#047857", bg: "#D1FAE5" };
    case "CANCELLED":
      return { label: "Đã hủy", color: "#B91C1C", bg: "#FEE2E2" };
    case "EXPIRED":
      return { label: "Đã hết hạn", color: "#C2410C", bg: "#FFEDD5" };
    default:
      return { label: status, color: "#6B7280", bg: "#F3F4F6" };
  }
}

export function getPaymentStatusMeta(status: string) {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Đã thanh toán",
        color: "#047857",
        bg: "#D1FAE5",
        icon: "check-circle" as const,
      };
    case "REFUNDED":
      return {
        label: "Đã hoàn tiền",
        color: "#7C3AED",
        bg: "#EDE9FE",
        icon: "rotate-ccw" as const,
      };
    case "FAILED":
      return {
        label: "Thanh toán thất bại",
        color: "#DC2626",
        bg: "#FEE2E2",
        icon: "alert-circle" as const,
      };
    case "CANCELLED":
      return {
        label: "Đã hủy thanh toán",
        color: "#6B7280",
        bg: "#F3F4F6",
        icon: "x-circle" as const,
      };
    default:
      return {
        label: "Chưa thanh toán",
        color: "#B45309",
        bg: "#FEF3C7",
        icon: "clock" as const,
      };
  }
}
