import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { getHomeServiceIcon } from "@/features/home/utils/homeServiceIcon";
import { ServiceIcon } from "@/features/service/components/ServiceIcon";
import { ServiceDuoIcon, getDuoKind } from "@/features/service/components/ServiceDuoIcon";
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
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();

  const fallback = getServiceGridVisual(code, sectionCode, COLORS);
  const mapped = getHomeServiceIcon(code, sectionCode);
  if (__DEV__) console.log("[ServiceCard] icon", code, JSON.stringify(icon));
  const duo = getDuoKind(code, sectionCode);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: "25%" }}
      className="items-center mb-5 px-1"
    >
      <View className="w-16 h-16 items-center justify-center">
        {duo && !icon ? (
          <ServiceDuoIcon kind={duo} size={56} color={COLORS.primary} />
        ) : (
          <ServiceIcon
            uri={icon}
            fallbackName={mapped ?? fallback.icon}
            size={52}
            color={mapped ? COLORS.primary : fallback.color}
          />
        )}
      </View>
      <Text
        className="text-[12.5px] font-semibold text-ink text-center mt-2"
        style={{ minHeight: 34, lineHeight: 17 }}
        numberOfLines={2}
      >
        {t(name)}
      </Text>
    </TouchableOpacity>
  );
}
