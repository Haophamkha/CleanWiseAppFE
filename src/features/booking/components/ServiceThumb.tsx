import { getHomeServiceIcon } from "@/features/home/utils/homeServiceIcon";
import { ServiceIcon } from "@/features/service/components/ServiceIcon";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

type McName = keyof typeof MaterialCommunityIcons.glyphMap;

// Đoán theo tên khi backend chưa trả service_code / icon
function guessByName(name: string): McName {
  const n = name.toLowerCase();
  if (n.includes("máy lạnh") || n.includes("điều hòa"))
    return "air-conditioner";
  if (n.includes("gói tháng") || n.includes("định kỳ")) return "calendar-check";
  if (n.includes("chuyển")) return "truck-fast";
  if (["sofa", "nệm", "rèm", "thảm"].some((w) => n.includes(w))) return "sofa";
  if (n.includes("dọn") || n.includes("vệ sinh")) return "broom";
  return "broom";
}

export function ServiceThumb({
  serviceName,
  serviceCode,
  sectionCode,
  iconUri,
  size = 52,
}: {
  serviceName: string;
  serviceCode?: string;
  sectionCode?: string;
  iconUri?: string | null;
  size?: number;
}) {
  const { COLORS } = useAppTheme();
  const name =
    getHomeServiceIcon(serviceCode ?? "", sectionCode ?? "") ??
    guessByName(serviceName);

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: COLORS.primaryLight,
        marginRight: 12,
      }}
    >
      <ServiceIcon
        uri={iconUri}
        fallbackName={name}
        size={size * 0.56}
        color={COLORS.primary}
      />
    </View>
  );
}
