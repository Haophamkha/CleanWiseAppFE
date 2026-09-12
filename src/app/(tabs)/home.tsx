import { AuthGreeting } from "@/components/common/AuthGreeting";
import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header trang chủ */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-gray-50">
        <TouchableOpacity>
          <Feather name="menu" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-emerald-700">Trang chủ</Text>
        {isAuthenticated ? (
          <NotificationBellButton />
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Component lời chào tích hợp sẵn */}
        <AuthGreeting />

        {/* Các thành phần nội dung khác của trang chủ */}
        <View className="bg-white rounded-2xl p-5 items-center justify-center border border-gray-100 shadow-sm mt-2">
          <Feather name="compass" size={32} color="#047857" />
          <Text className="text-gray-800 font-bold text-base mt-3">
            Khám phá dịch vụ dọn dẹp
          </Text>
          <Text className="text-gray-400 text-xs text-center mt-1">
            Nội dung và danh mục dịch vụ đang được cập nhật từ hệ thống...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
