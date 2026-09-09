import AddressForm, {
    AddressFormValues,
} from "@/components/address/AddressForm";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// TODO: thay bằng data lấy từ API theo id khi BE sẵn sàng
const MOCK_DETAIL: AddressFormValues = {
  recipientName: "Nguyễn Văn A",
  phone: "0901234567",
  addressLine: "123 Lê Lợi",
  ward: "Phường Bến Nghé",
  district: "Quận 1",
  province: "TP. Hồ Chí Minh",
};

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [values, setValues] = useState<AddressFormValues>(MOCK_DETAIL);

  const handleChange = (field: keyof AddressFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    // TODO: gọi API cập nhật địa chỉ id={id} khi BE sẵn sàng
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Xóa địa chỉ", "Bạn có chắc muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          // TODO: gọi API xóa địa chỉ id={id} khi BE sẵn sàng
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            Cập nhật địa chỉ
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color="#DC2626" />
        </TouchableOpacity>
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
          onPress={handleUpdate}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Cập nhật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
