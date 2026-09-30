import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function FavoriteWorkersEmpty() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-20">
      <View className="w-20 h-20 rounded-full bg-danger-light items-center justify-center">
        <Feather name="heart" size={32} color={COLORS.danger} />
      </View>
      <Text className="text-ink font-extrabold text-lg mt-5">
        Chưa có nhân viên yêu thích
      </Text>
      <Text className="text-ink-muted text-sm leading-5 text-center mt-2">
        Sau khi có nhân viên nhận việc, hãy mở hồ sơ và nhấn biểu tượng tim để
        lưu lại.
      </Text>
      <TouchableOpacity
        className="bg-primary rounded-xl px-6 py-3 mt-5"
        onPress={() => router.push("/(tabs)/booking")}
      >
        <Text className="text-white font-bold">Xem đơn hàng</Text>
      </TouchableOpacity>
    </View>
  );
}
