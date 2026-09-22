import { COLORS } from "@/components/service/formFieldShared";
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
        <View className="w-6 h-6 rounded-full bg-emerald-50 items-center justify-center mr-2">
          <Feather name={icon} size={13} color={COLORS.primary} />
        </View>
      )}
      <Text className="font-bold text-[16px]" style={{ color: COLORS.text }}>
        {children}
      </Text>
    </View>
  );
}
