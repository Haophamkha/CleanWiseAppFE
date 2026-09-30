import { COLORS } from "@/constants/theme";

const TILE = { bg: COLORS.primaryLight, color: COLORS.primary };

export const SERVICE_SECTION_VISUALS: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  HOME_CLEANING: { icon: "broom", ...TILE },
  APPLIANCE_CLEANING: { icon: "air-conditioner", ...TILE },
  MOVING: { icon: "truck-fast", ...TILE },
  UPHOLSTERY_CLEANING: { icon: "sofa", ...TILE },
};

const DEFAULT_VISUAL = { icon: "briefcase-outline", ...TILE };

export function getServiceVisual(sectionCode: string) {
  return SERVICE_SECTION_VISUALS[sectionCode] ?? DEFAULT_VISUAL;
}

// Icon riêng cho vài mã dịch vụ cụ thể
const CODE_ICON_OVERRIDES: Record<string, string> = {
  HOME_CLEANING_MONTHLY: "calendar-check",
};

export function getServiceGridVisual(code: string, sectionCode: string) {
  const base = getServiceVisual(sectionCode);
  return { ...base, icon: CODE_ICON_OVERRIDES[code] ?? base.icon };
}
