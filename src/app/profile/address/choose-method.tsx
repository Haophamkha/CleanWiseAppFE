import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ChooseAddressMethodScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Chọn địa chỉ mới
        </Text>
      </View>

      <View className="flex-1 px-6 pt-8" style={{ gap: 16 }}>
        <TouchableOpacity
          className="flex-row items-center border border-gray-200 rounded-2xl p-5"
          activeOpacity={0.8}
          onPress={() => router.push("/profile/address/select-location")}
        >
          <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mr-4">
            <Feather name="map-pin" size={22} color="#047857" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-base mb-1">
              Chọn trên bản đồ
            </Text>
            <Text className="text-gray-500 text-sm">
              Ghim vị trí, hệ thống tự điền địa chỉ giúp bạn
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center border border-gray-200 rounded-2xl p-5"
          activeOpacity={0.8}
          onPress={() => router.push("/profile/address/add")}
        >
          <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mr-4">
            <MaterialCommunityIcons
              name="pencil-outline"
              size={22}
              color="#047857"
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-base mb-1">
              Nhập thủ công
            </Text>
            <Text className="text-gray-500 text-sm">
              Tự chọn tỉnh/thành, phường/xã và nhập địa chỉ
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
