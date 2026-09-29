// components/common/MenuListItem.tsx
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: string; // số đếm, hiện dạng chấm đỏ
  comingSoon?: boolean; // mục chưa làm: hiện nhãn "Sắp có" và không bấm được
  onPress?: () => void;
};

// Một dòng trong MenuGroup (không tự có nền/viền)
export function MenuListItem({
  icon,
  label,
  badge,
  comingSoon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5"
      onPress={onPress}
      disabled={comingSoon || !onPress}
      activeOpacity={0.6}
    >
      <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center mr-3">
        <Feather name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text
        className={`flex-1 text-base font-medium ${
          comingSoon ? "text-ink-muted" : "text-ink"
        }`}
      >
        {label}
      </Text>
      {comingSoon ? (
        <View className="bg-canvas rounded-full px-2.5 py-1">
          <Text className="text-xs font-semibold text-ink-muted">Sắp có</Text>
        </View>
      ) : (
        <>
          {!!badge && (
            <View className="bg-danger rounded-full px-2 py-0.5 mr-2">
              <Text className="text-white text-xs font-bold">{badge}</Text>
            </View>
          )}
          <Feather name="chevron-right" size={20} color={COLORS.inkMuted} />
        </>
      )}
    </TouchableOpacity>
  );
}
