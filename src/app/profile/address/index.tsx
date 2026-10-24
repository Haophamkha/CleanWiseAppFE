import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import ScreenContainer from "@/components/ScreenContainer";
import { useGetAddressesQuery } from "@/features/address/api/addressApi";
import AddressCard from "@/features/address/components/AddressCard";
import { setPickedAddress } from "@/features/address/stores/addressPickerSlice";
import type { Address } from "@/features/address/types/Address";
import { useAppDispatch } from "@/store/hooks";
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
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

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
      <View className="flex-1 bg-surface">
        <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-line">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-ink">
            {title || (isPicking ? t("Chọn địa chỉ") : t("Danh sách địa chỉ đã lưu"))}
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.success} />
          </View>
        ) : isError ? (
          <View className="items-center justify-center mt-20">
            <Text className="text-red-500">
              {t("Không tải được danh sách địa chỉ")}</Text>
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
                <Feather name="map-pin" size={40} color={COLORS.line} />
                <Text className="text-ink-muted mt-3">{t("Chưa có địa chỉ nào")}</Text>
              </View>
            }
          />
        )}

        <View className="px-6 pb-8 pt-4 border-t border-line">
          <TouchableOpacity
            className="flex-row bg-emerald-700 rounded-xl py-4 items-center justify-center"
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              {t("Thêm địa chỉ mới")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
