import { ROUTES } from "@/config/constants";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  message?: string;
};

export function RequireLoginNotice({
  message = "Đăng nhập để xem đầy đủ thông tin của bạn",
}: Props) {
  return (
    <View className="bg-white rounded-2xl items-center px-6 py-10 mb-3 border border-gray-100">
      <View className="w-14 h-14 rounded-full bg-emerald-50 items-center justify-center mb-4">
        <Feather name="lock" size={24} color="#047857" />
      </View>
      <Text className="text-gray-900 font-semibold text-base mb-1 text-center">
        Bạn chưa đăng nhập
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-5">{message}</Text>
      <TouchableOpacity
        className="bg-emerald-700 rounded-xl px-8 py-3"
        onPress={() => router.push(ROUTES.LOGIN as any)}
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold">Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  );
}
