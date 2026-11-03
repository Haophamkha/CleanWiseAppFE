import { translate as defaultTranslate } from "@/features/language/i18n";

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
 * Tất cả thông báo liên quan đến buổi làm đều mở trang đơn dịch vụ.
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

export function getNotificationTypeMap(COLORS: ThemeColors, translateText = defaultTranslate): Record<string, NotificationTypeMeta> {
  return {
  BOOKING: {
    label: translateText("Đơn dịch vụ"),
    iconLibrary: "material-community",
    iconName: "calendar-check",
    iconBgColor: COLORS.primaryLight,
    iconColor: COLORS.primaryDark,
  },
  PAYMENT: {
    label: translateText("Thanh toán"),
    iconLibrary: "material-community",
    iconName: "wallet",
    iconBgColor: COLORS.successLight,
    iconColor: COLORS.success,
  },
  ASSIGNMENT: {
    label: translateText("Phân công"),
    iconLibrary: "material-community",
    iconName: "account-check",
    iconBgColor: COLORS.infoLight,
    iconColor: COLORS.info,
  },
  COMPLAINT: {
    label: translateText("Khiếu nại"),
    iconLibrary: "material-community",
    iconName: "message-alert",
    iconBgColor: COLORS.dangerLight,
    iconColor: COLORS.danger,
  },
  SYSTEM: {
    label: translateText("Hệ thống"),
    iconLibrary: "material-community",
    iconName: "bell-ring",
    iconBgColor: COLORS.accentLight,
    iconColor: COLORS.accentDark,
  },
};
}

export function getNotificationTypeMeta(type: string, COLORS: ThemeColors, translateText = defaultTranslate): NotificationTypeMeta {
  const map = getNotificationTypeMap(COLORS, translateText);
  return map[type] ?? map.SYSTEM;
}

export function getLocalizedNotificationFilterOptions(translateText = defaultTranslate): {
  value: "ALL" | keyof ReturnType<typeof getNotificationTypeMap>;
  label: string;
}[] {
  return [
    { value: "ALL", label: translateText("Tất cả") },
    { value: "BOOKING", label: translateText("Đơn dịch vụ") },
    { value: "PAYMENT", label: translateText("Thanh toán") },
    { value: "ASSIGNMENT", label: translateText("Phân công") },
    { value: "COMPLAINT", label: translateText("Khiếu nại") },
  ];
}
