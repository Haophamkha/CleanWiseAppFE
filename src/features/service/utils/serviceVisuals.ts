import type { ThemeColors } from "@/constants/theme";
const ICONS: Record<string, string> = { HOME_CLEANING: "broom", APPLIANCE_CLEANING: "air-conditioner", MOVING: "truck-fast", UPHOLSTERY_CLEANING: "sofa" };
export function getServiceVisual(sectionCode: string, COLORS: ThemeColors) {
  return { icon: ICONS[sectionCode] ?? "briefcase-outline", bg: COLORS.primaryLight, color: COLORS.primary };
}
export function getServiceGridVisual(code: string, sectionCode: string, COLORS: ThemeColors) {
  const base = getServiceVisual(sectionCode, COLORS);
  return { ...base, icon: code === "HOME_CLEANING_MONTHLY" ? "calendar-check" : base.icon };
}
