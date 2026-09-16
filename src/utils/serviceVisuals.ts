// src/utils/serviceVisuals.ts
export const SERVICE_SECTION_VISUALS: Record<
  string,
  { icon: string; bg: string; color: string }
> = {
  HOME_CLEANING: { icon: "broom", bg: "#ECFDF5", color: "#047857" },
  APPLIANCE_CLEANING: {
    icon: "air-conditioner",
    bg: "#EFF6FF",
    color: "#1D4ED8",
  },
  MOVING: { icon: "truck-fast", bg: "#FFF7ED", color: "#C2410C" },
  UPHOLSTERY_CLEANING: {
    icon: "sofa",
    bg: "#FDF2F8",
    color: "#BE185D",
  },
};

const DEFAULT_VISUAL = {
  icon: "briefcase-outline",
  bg: "#F3F4F6",
  color: "#4B5563",
};

export function getServiceVisual(sectionCode: string) {
  return SERVICE_SECTION_VISUALS[sectionCode] ?? DEFAULT_VISUAL;
}

// Icon riêng cho vài mã dịch vụ cụ thể
const CODE_ICON_OVERRIDES: Record<string, string> = {
  HOME_CLEANING_MONTHLY: "calendar-check",
};

export function getServiceGridVisual(code: string, sectionCode: string) {
  const base = getServiceVisual(sectionCode);

  return {
    ...base,
    icon: CODE_ICON_OVERRIDES[code] ?? base.icon,
  };
}
