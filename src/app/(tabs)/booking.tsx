import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function BookingScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity>
          <Feather name="menu" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-emerald-700">Đơn hàng</Text>
        {isAuthenticated ? (
          <NotificationBellButton />
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {isAuthenticated ? (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Feather name="clipboard" size={40} color="#D1D5DB" />
          <Text className="text-gray-400 mt-3">Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <View className="flex-1 px-5 pt-2">
          <RequireLoginNotice message="Đăng nhập để xem và quản lý các đơn hàng dịch vụ của bạn" />
        </View>
      )}
    </View>
  );
}
