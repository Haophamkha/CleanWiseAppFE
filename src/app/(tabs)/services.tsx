// app/(tabs)/services.tsx
import { ServiceGridItem } from "@/components/service/ServiceGridItem";
import { useGetServicesQuery } from "@/services/serviceApi";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function ServicesScreen() {
  const { data: services, isLoading, isError } = useGetServicesQuery();

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Dịch vụ</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#047857" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500">Không tải được danh sách dịch vụ</Text>
        </View>
      ) : !services || services.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="grid" size={40} color="#D1D5DB" />
          <Text className="text-gray-400 mt-3">Chưa có dịch vụ nào</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap">
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
        </ScrollView>
      )}
    </View>
  );
}
