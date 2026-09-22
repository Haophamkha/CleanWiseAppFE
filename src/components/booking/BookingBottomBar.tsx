import { COLORS } from "@/components/service/formFieldShared";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BookingBottomBar({ onCancel }: { onCancel?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-5 pt-3"
      style={{
        borderTopWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#FFFFFF",
        paddingBottom: Math.max(insets.bottom, 12) + 8,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        className="rounded-xl py-3.5 items-center"
        style={{ borderWidth: 1.5, borderColor: "#FCA5A5" }}
        onPress={() => {
          onCancel?.();
        }}
      >
        <Text className="font-bold text-[14px]" style={{ color: "#DC2626" }}>
          Hủy đơn hàng
        </Text>
      </TouchableOpacity>
    </View>
  );
}
