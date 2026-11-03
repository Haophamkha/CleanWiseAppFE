import { translate as defaultTranslate } from "@/features/language/i18n";

import type { ReviewFilters } from "@/features/review/types/ReviewFilters";

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  period: "all",
  editable_only: false,
  ordering: "newest",
};

export function getLocalizedReviewPeriodLabels(translateText = defaultTranslate) {
  return {
    all: translateText("Tất cả thời gian"),
    "30_days": translateText("30 ngày gần đây"),
    "3_months": translateText("3 tháng gần đây"),
    custom: translateText("Chọn khoảng ngày"),
  };
}

export function reviewFilterLabels(filters: ReviewFilters, translateText = defaultTranslate) {
  return [
    ...(filters.rating ? [translateText("{{value0}} sao", { value0: filters.rating, count: filters.rating })] : []),
    ...(filters.period === "custom"
      ? [
          `${displayFilterDate(filters.date_from)} – ${displayFilterDate(filters.date_to)}`,
        ]
      : filters.period !== "all"
        ? [getLocalizedReviewPeriodLabels(translateText)[filters.period]]
        : []),
    ...(filters.editable_only ? [translateText("Còn hạn chỉnh sửa")] : []),
    ...(filters.ordering === "oldest" ? [translateText("Cũ nhất trước")] : []),
  ];
}

export function displayFilterDate(value?: string) {
  return value ? value.split("-").reverse().join("/") : "";
}

export function parseFilterDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  )
    return null;
  return `${year}-${month}-${day}`;
}
