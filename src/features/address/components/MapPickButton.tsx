// components/address/MapPickButton.tsx
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

export function MapPickButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className="flex-row items-center justify-center bg-primary-soft border border-primary-border rounded-lg py-3.5 mb-6"
    >
      <Feather name="map-pin" size={16} color={COLORS.primary} />
      <Text className="text-sm font-semibold text-primary ml-2">{label}</Text>
    </TouchableOpacity>
  );
}
