import { translate as t, getLocale } from "@/features/language/i18n";
export function formatVnd(amount: number): string {
  return t("{{value0}}đ", { value0: amount.toLocaleString(getLocale()) });
}
