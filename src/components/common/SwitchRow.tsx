import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather } from "@expo/vector-icons";
import { Switch, Text, View } from "react-native";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export function SwitchRow({ icon, label, desc, value, onChange }: Props) {
  const { COLORS, isDark } = useAppTheme();

  return (
    <View className="flex-row items-center px-4 py-3.5">
      <View className={`w-10 h-10 items-center justify-center mr-3 ${isDark ? "bg-surface-muted" : "bg-primary-soft"}`} style={{ borderRadius: 12 }}>
        <Feather name={icon} size={18} color={isDark ? COLORS.inkSoft : COLORS.primary} />
      </View>
      <View className="flex-1 pr-3">
        <Text className="text-base font-medium text-ink">{label}</Text>
        {!!desc && (
          <Text className="text-xs text-ink-muted mt-0.5">{desc}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.line, true: isDark ? COLORS.primaryFill : COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );
}
