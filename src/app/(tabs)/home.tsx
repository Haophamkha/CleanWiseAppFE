import { AuthGreeting } from "@/components/common/AuthGreeting";
import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { ServiceGridItem } from "@/components/service/ServiceGridItem";
import { useGetServicesQuery } from "@/services/serviceApi";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  const { data: services, isLoading, isError } = useGetServicesQuery();

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

        {/* Danh sách dịch vụ */}
        <View className="mt-4 mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900">Dịch vụ</Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator color="#047857" />
          </View>
        ) : isError ? (
          <View className="items-center justify-center py-10">
            <Text className="text-red-500">
              Không tải được danh sách dịch vụ
            </Text>
          </View>
        ) : !services || services.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Feather name="grid" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3">Chưa có dịch vụ nào</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap pb-6">
            {services.map((item) => (
              <ServiceGridItem
                key={item.id}
                code={item.code}
                sectionCode={item.section_code}
                name={item.name}
                onPress={() => router.push(`/services/${item.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
