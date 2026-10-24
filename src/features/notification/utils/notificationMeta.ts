import { translate as t } from "@/features/language/i18n";
import type { ThemeColors } from "@/constants/theme";


export type NotificationIconLibrary = "feather" | "material-community";

interface NotificationTypeMeta {
  label: string;
  iconLibrary: NotificationIconLibrary;
  iconName: string;
  iconBgColor: string;
  iconColor: string;
}

/**
 * Trả về route tương ứng khi người dùng nhấn vào thông báo.
 * Tất cả thông báo liên quan đến buổi làm đều mở trang đơn hàng.
 */
export function getNotificationRoute(n: {
  target?: string;
  type?: string;
  related_booking?: number | null;
}): string | null {
  if (n.target === "wallet") {
    return "/profile/wallets/wallet";
  }

  if (n.related_booking) {
    return `/booking/${n.related_booking}`;
  }

  if (n.type === "PAYMENT") {
    return "/profile/wallets/wallet";
  }

  return null;
}

export function getNotificationTypeMap(COLORS: ThemeColors): Record<string, NotificationTypeMeta> {
  return {
  BOOKING: {
    label: t("Đơn hàng"),
    iconLibrary: "material-community",
    iconName: "calendar-check",
    iconBgColor: COLORS.primaryLight,
    iconColor: COLORS.primaryDark,
  },
  PAYMENT: {
    label: t("Thanh toán"),
    iconLibrary: "material-community",
    iconName: "wallet",
    iconBgColor: COLORS.successLight,
    iconColor: COLORS.success,
  },
  ASSIGNMENT: {
    label: t("Phân công"),
    iconLibrary: "material-community",
    iconName: "account-check",
    iconBgColor: COLORS.infoLight,
    iconColor: COLORS.info,
  },
  COMPLAINT: {
    label: t("Khiếu nại"),
    iconLibrary: "material-community",
    iconName: "message-alert",
    iconBgColor: COLORS.dangerLight,
    iconColor: COLORS.danger,
  },
  SYSTEM: {
    label: t("Hệ thống"),
    iconLibrary: "material-community",
    iconName: "bell-ring",
    iconBgColor: COLORS.accentLight,
    iconColor: COLORS.accentDark,
  },
};
}

export function getNotificationTypeMeta(type: string, COLORS: ThemeColors): NotificationTypeMeta {
  const map = getNotificationTypeMap(COLORS);
  return map[type] ?? map.SYSTEM;
}

export function getLocalizedNotificationFilterOptions(): {
  value: "ALL" | keyof ReturnType<typeof getNotificationTypeMap>;
  label: string;
}[] {
  return [
    { value: "ALL", label: t("Tất cả") },
    { value: "BOOKING", label: t("Đơn hàng") },
    { value: "PAYMENT", label: t("Thanh toán") },
    { value: "ASSIGNMENT", label: t("Phân công") },
    { value: "COMPLAINT", label: t("Khiếu nại") },
  ];
}
