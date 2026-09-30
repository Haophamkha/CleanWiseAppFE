import { COLORS } from "@/constants/theme";
import { getHomeServiceIcon } from "@/features/home/utils/homeServiceIcon";
import { ServiceIcon } from "@/features/service/components/ServiceIcon";
import { getServiceGridVisual } from "@/features/service/utils/serviceVisuals";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  code: string;
  sectionCode: string;
  name: string;
  description?: string;
  icon?: string | null;
  onPress: () => void;
};

export function ServiceCard({ code, sectionCode, name, icon, onPress }: Props) {
  const fallback = getServiceGridVisual(code, sectionCode);
  const mapped = getHomeServiceIcon(code, sectionCode);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: "25%" }}
      className="items-center mb-5 px-1"
    >
      <View className="w-16 h-16 rounded-2xl bg-primary-light items-center justify-center">
        <ServiceIcon
          uri={icon}
          fallbackName={mapped ?? fallback.icon}
          size={34}
          color={mapped ? COLORS.primary : fallback.color}
        />
      </View>
      <Text
        className="text-[12.5px] font-medium text-ink text-center mt-2"
        style={{ minHeight: 34, lineHeight: 17 }}
        numberOfLines={2}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
