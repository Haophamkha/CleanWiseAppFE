import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";

export function formatMessageTime(iso: string, translateText = defaultTranslate): string {
  return new Date(iso).toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string, translateText = defaultTranslate): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return translateText("Vừa xong");
  if (diffMin < 60) return translateText("{{value0}} phút trước", { value0: diffMin , count: diffMin});

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return translateText("{{value0}} giờ trước", { value0: diffHour , count: diffHour});

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return translateText("{{value0}} ngày trước", { value0: diffDay , count: diffDay});

  return date.toLocaleDateString(getLocale(translateText));
}

export function formatScheduleRange(startIso: string, endIso: string, translateText = defaultTranslate): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const now = new Date();

  const isSameDay =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate();

  const dayLabel = isSameDay
    ? translateText("Hôm nay")
    : start.toLocaleDateString(getLocale(translateText), { day: "2-digit", month: "2-digit" });

  const startTime = start.toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dayLabel}, ${startTime} - ${endTime}`;
}

export function formatNotificationTime(iso: string, translateText = defaultTranslate): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMin < 1) return translateText("Vừa xong");
  if (diffMin < 60) return translateText("{{value0}} phút trước", { value0: diffMin , count: diffMin});

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    const diffHour = Math.floor(diffMin / 60);
    return translateText("{{value0}} giờ trước", { value0: diffHour , count: diffHour});
  }
  if (date >= startOfYesterday) {
    return translateText("Hôm qua");
  }

  const time = date.toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString(getLocale(translateText), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} - ${day}`;
}
