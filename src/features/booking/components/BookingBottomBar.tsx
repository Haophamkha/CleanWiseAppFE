import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BookingBottomBar({ onCancel }: { onCancel?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-surface border-t border-line px-5 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center justify-center h-12 rounded-2xl bg-danger-light"
        onPress={() => onCancel?.()}
      >
        <Feather name="x-circle" size={17} color={COLORS.danger} />
        <Text className="font-bold text-[14px] text-danger ml-2">
          Hủy đơn hàng
        </Text>
      </TouchableOpacity>
    </View>
  );
}
