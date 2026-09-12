export type NotificationIconLibrary = "feather" | "material-community";

interface NotificationTypeMeta {
  label: string;
  iconLibrary: NotificationIconLibrary;
  iconName: string;
}

// Icon theo type - màu nền/màu icon tính riêng theo trạng thái đã đọc,
// xử lý trong NotificationItem.
const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeMeta> = {
  BOOKING: {
    label: "Đơn hàng",
    iconLibrary: "material-community",
    iconName: "broom",
  },
  PAYMENT: {
    label: "Thanh toán",
    iconLibrary: "feather",
    iconName: "check-circle",
  },
  PROMOTION: {
    label: "Khuyến mãi",
    iconLibrary: "feather",
    iconName: "tag",
  },
  REVIEW: {
    label: "Đánh giá",
    iconLibrary: "feather",
    iconName: "star",
  },
  SYSTEM: {
    label: "Hệ thống",
    iconLibrary: "feather",
    iconName: "bell",
  },
};

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_MAP[type] ?? NOTIFICATION_TYPE_MAP.SYSTEM;
}

export const NOTIFICATION_FILTER_OPTIONS: {
  value: "ALL" | keyof typeof NOTIFICATION_TYPE_MAP;
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "BOOKING", label: "Đơn hàng" },
  { value: "PAYMENT", label: "Thanh toán" },
  { value: "PROMOTION", label: "Khuyến mãi" },
  { value: "REVIEW", label: "Đánh giá" },
];
