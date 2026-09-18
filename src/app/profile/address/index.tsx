import ScreenContainer from "@/components/ScreenContainer";
import AddressCard from "@/components/address/AddressCard";
import { useGetAddressesQuery } from "@/services/addressApi";
import { setPickedAddress } from "@/store/addressPickerSlice";
import { useAppDispatch } from "@/store/hooks";
import type { Address } from "@/types/Address";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddressListScreen() {
  const { pickerKey, title } = useLocalSearchParams<{
    pickerKey?: string;
    title?: string;
  }>();
  const isPicking = !!pickerKey;

  const dispatch = useAppDispatch();
  const { data: addresses, isLoading, isError } = useGetAddressesQuery();

  const handleEdit = (id: number) => {
    router.push({
      pathname: "/profile/address/[id]",
      params: { id: String(id) },
    });
  };

  const handleSelect = (address: Address) => {
    if (!pickerKey) return;
    dispatch(setPickedAddress({ key: pickerKey, address }));
    router.back();
  };

  const handleAdd = () => {
    router.push({
      pathname: "/profile/address/choose-method",
      params: pickerKey ? { pickerKey } : {},
    });
  };

  return (
    <ScreenContainer>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            {title || (isPicking ? "Chọn địa chỉ" : "Danh sách địa chỉ đã lưu")}
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#047857" />
          </View>
        ) : isError ? (
          <View className="items-center justify-center mt-20">
            <Text className="text-red-500">
              Không tải được danh sách địa chỉ
            </Text>
          </View>
        ) : (
          <FlatList
            data={addresses ?? []}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                onEdit={handleEdit}
                onSelect={isPicking ? handleSelect : undefined}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center mt-20">
                <Feather name="map-pin" size={40} color="#D1D5DB" />
                <Text className="text-gray-400 mt-3">Chưa có địa chỉ nào</Text>
              </View>
            }
          />
        )}

        <View className="px-6 pb-8 pt-4 border-t border-gray-100">
          <TouchableOpacity
            className="flex-row bg-emerald-700 rounded-xl py-4 items-center justify-center"
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Thêm địa chỉ mới
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
