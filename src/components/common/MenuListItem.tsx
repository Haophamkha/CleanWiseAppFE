import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  badge?: string;
  onPress?: () => void;
};

export function MenuListItem({ icon, label, badge, onPress }: Props) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
        <Feather name={icon} size={18} color="#047857" />
      </View>
      <Text className="flex-1 text-gray-900 font-medium text-base">
        {label}
      </Text>
      {!!badge && (
        <View className="bg-red-500 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
