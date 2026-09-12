import { ROUTES } from "@/config/constants";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function AuthGreeting() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  // Lấy tên hoặc họ tên, ưu tiên first_name cho thân mật giống Shopee/Lazada
  const displayName = user
    ? `${user.first_name || user.last_name || "Bạn"}`.trim()
    : "Khách";

  return (
    <View className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5 mb-4 shadow-sm">
      {isAuthenticated ? (
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Xin chào trở lại 👋
            </Text>
            <Text
              className="text-xl font-bold text-gray-900 mt-1"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-emerald-100 items-center justify-center">
            <Feather name="smile" size={22} color="#047857" />
          </View>
        </View>
      ) : (
        <View>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
              <Feather name="user" size={20} color="#047857" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">
                Chào mừng bạn đến với CleanWise
              </Text>
              <Text className="text-base font-bold text-gray-900">
                Đăng nhập để trải nghiệm ngay
              </Text>
            </View>
          </View>

          {/* Hai nút Đăng nhập & Đăng ký nằm cạnh nhau */}
          <View className="flex-row space-x-3 mt-1" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 bg-emerald-700 rounded-xl py-3 items-center shadow-sm"
              onPress={() => router.push(ROUTES.LOGIN as any)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white border border-emerald-700 rounded-xl py-3 items-center"
              onPress={() => router.push(ROUTES.REGISTER as any)}
              activeOpacity={0.8}
            >
              <Text className="text-emerald-700 font-bold text-sm">
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
