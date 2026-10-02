import type { ReviewFilters } from "@/features/review/types/ReviewFilters";

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  period: "all",
  editable_only: false,
  ordering: "newest",
};

export const REVIEW_PERIOD_LABELS = {
  all: "Tất cả thời gian",
  "30_days": "30 ngày gần đây",
  "3_months": "3 tháng gần đây",
  custom: "Chọn khoảng ngày",
};

export function reviewFilterLabels(filters: ReviewFilters) {
  return [
    ...(filters.rating ? [`${filters.rating} sao`] : []),
    ...(filters.period === "custom"
      ? [
          `${displayFilterDate(filters.date_from)} – ${displayFilterDate(filters.date_to)}`,
        ]
      : filters.period !== "all"
        ? [REVIEW_PERIOD_LABELS[filters.period]]
        : []),
    ...(filters.editable_only ? ["Còn hạn chỉnh sửa"] : []),
    ...(filters.ordering === "oldest" ? ["Cũ nhất trước"] : []),
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
