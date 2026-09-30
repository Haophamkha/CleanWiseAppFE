import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function SectionTitle({
  icon,
  children,
}: {
  icon?: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center mb-3">
      {icon && (
        <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center mr-2.5">
          <Feather name={icon} size={15} color={COLORS.primaryDark} />
        </View>
      )}
      <Text className="font-bold text-base text-ink">{children}</Text>
    </View>
  );
}
