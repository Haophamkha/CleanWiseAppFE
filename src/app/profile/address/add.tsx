import AddressForm, {
    AddressFormValues,
} from "@/components/address/AddressForm";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AddAddressScreen() {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    addressLine?: string;
  }>();

  const [values, setValues] = useState<AddressFormValues>({
    recipientName: "",
    phone: "",
    addressLine: params.addressLine ?? "",
    ward: "",
    district: "",
    province: "",
  });

  const handleChange = (field: keyof AddressFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // TODO: gọi API thêm địa chỉ khi BE sẵn sàng
    // kèm theo params.latitude, params.longitude để lưu tọa độ nếu cần
    router.dismissAll();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Thêm địa chỉ</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        <AddressForm values={values} onChange={handleChange} />
      </ScrollView>

      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-emerald-700 rounded-xl py-4 items-center"
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Thêm địa chỉ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
