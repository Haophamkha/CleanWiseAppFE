import { MaterialCommunityIcons } from "@expo/vector-icons";

type McIconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Map theo code dịch vụ; khớp chính xác trước, rồi mới khớp theo tiền tố
const ICON_BY_CODE: Record<string, McIconName> = {
  HOME_CLEANING_HOURLY: "broom",
  HOME_CLEANING_MONTHLY: "calendar-check",
  HOME_MOVING: "truck-fast",
  UPHOLSTERY_CLEANING: "sofa",
};

const ICON_BY_PREFIX: { prefix: string; icon: McIconName }[] = [
  { prefix: "AIR_CONDITIONER", icon: "air-conditioner" },
];

const ICON_BY_SECTION: Record<string, McIconName> = {
  HOME_CLEANING: "broom",
  APPLIANCE_CLEANING: "air-conditioner",
  MOVING: "truck-fast",
  UPHOLSTERY_CLEANING: "sofa",
};

export function getHomeServiceIcon(
  code: string,
  sectionCode: string,
): McIconName | null {
  return (
    ICON_BY_CODE[code] ??
    ICON_BY_PREFIX.find((p) => code.startsWith(p.prefix))?.icon ??
    ICON_BY_SECTION[sectionCode] ??
    null
  );
}
