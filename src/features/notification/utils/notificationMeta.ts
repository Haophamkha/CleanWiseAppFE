import { COLORS } from "@/constants/theme";

export type NotificationIconLibrary = "feather" | "material-community";

interface NotificationTypeMeta {
  label: string;
  iconLibrary: NotificationIconLibrary;
  iconName: string;
  iconBgColor: string;
  iconColor: string;
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeMeta> = {
  BOOKING: {
    label: "Đơn hàng",
    iconLibrary: "material-community",
    iconName: "calendar-check",
    iconBgColor: COLORS.primaryLight,
    iconColor: COLORS.primaryDark,
  },
  PAYMENT: {
    label: "Thanh toán",
    iconLibrary: "material-community",
    iconName: "wallet",
    iconBgColor: COLORS.successLight,
    iconColor: COLORS.success,
  },
  ASSIGNMENT: {
    label: "Phân công",
    iconLibrary: "material-community",
    iconName: "account-check",
    iconBgColor: COLORS.infoLight,
    iconColor: COLORS.info,
  },
  COMPLAINT: {
    label: "Khiếu nại",
    iconLibrary: "material-community",
    iconName: "message-alert",
    iconBgColor: COLORS.dangerLight,
    iconColor: COLORS.danger,
  },
  SYSTEM: {
    label: "Hệ thống",
    iconLibrary: "material-community",
    iconName: "bell-ring",
    iconBgColor: COLORS.accentLight,
    iconColor: COLORS.accentDark,
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
  { value: "ASSIGNMENT", label: "Phân công" },
  { value: "COMPLAINT", label: "Khiếu nại" },
];
