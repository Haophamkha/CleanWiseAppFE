import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
// components/common/MenuListItem.tsx

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: string; // số đếm, hiện dạng chấm đỏ
  comingSoon?: boolean; // mục chưa làm: hiện nhãn "Sắp có" và không bấm được
  onPress?: () => void;
  compact?: boolean;
};

// Một dòng trong MenuGroup (không tự có nền/viền)
export function MenuListItem({
  icon,
  label,
  badge,
  comingSoon,
  onPress,
  compact = false,
}: Props) {
  const { t } = useTranslation();

  const { COLORS, isDark } = useAppTheme();

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5"
      style={compact ? { minHeight: 46, paddingHorizontal: 12, paddingVertical: 7 } : undefined}
      accessibilityRole="button"
      onPress={onPress}
      disabled={comingSoon || !onPress}
      activeOpacity={0.6}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isDark ? "bg-surface-muted" : "bg-primary-soft"}`}
        style={compact ? { width: 30, height: 30, borderRadius: 9, marginRight: 10 } : undefined}
      >
        <Feather name={icon} size={compact ? 16 : 18} color={isDark ? COLORS.inkSoft : COLORS.primary} />
      </View>
      <Text
        style={compact ? { fontSize: 13, lineHeight: 19 } : undefined}
        className={`flex-1 text-base font-medium ${
          comingSoon ? "text-ink-muted" : "text-ink"
        }`}
      >
        {label}
      </Text>
      {comingSoon ? (
        <View className="bg-canvas rounded-full px-2.5 py-1">
          <Text className="text-xs font-semibold text-ink-muted">{t("Sắp có")}</Text>
        </View>
      ) : (
        <>
          {!!badge && (
            <View className="bg-danger-fill rounded-full px-2 py-0.5 mr-2">
              <Text className="text-white text-xs font-bold">{badge}</Text>
            </View>
          )}
          <Feather name="chevron-right" size={compact ? 16 : 20} color={COLORS.inkMuted} />
        </>
      )}
    </TouchableOpacity>
  );
}
