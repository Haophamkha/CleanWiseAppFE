import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";

export function formatVnd(amount: number, translateText = defaultTranslate): string {
  return translateText("{{value0}}đ", { value0: amount.toLocaleString(getLocale(translateText)) });
}
