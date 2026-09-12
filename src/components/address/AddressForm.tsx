import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export interface AddressFormValues {
  label: string;
  receiver_name: string;
  receiver_phone: string;
  address_line: string;
}

interface AddressFormProps {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
}

const FIELDS: {
  key: keyof AddressFormValues;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  keyboardType?: "default" | "phone-pad";
}[] = [
  {
    key: "label",
    label: "Tên gợi nhớ (Nhà riêng, Công ty...)",
    icon: "tag",
    placeholder: "Nhà riêng",
  },
  {
    key: "receiver_name",
    label: "Họ tên người nhận",
    icon: "user",
    placeholder: "Nhập họ tên",
  },
  {
    key: "receiver_phone",
    label: "Số điện thoại",
    icon: "phone",
    placeholder: "Nhập số điện thoại",
    keyboardType: "phone-pad",
  },
  {
    key: "address_line",
    label: "Địa chỉ chi tiết",
    icon: "map-pin",
    placeholder: "Số nhà, tên đường",
  },
];

export default function AddressForm({ values, onChange }: AddressFormProps) {
  return (
    <View>
      {FIELDS.map((field) => (
        <View key={field.key}>
          <Text className="text-gray-700 font-medium mb-1">{field.label}</Text>

          <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <Feather name={field.icon} size={18} color="#9CA3AF" />

            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder={field.placeholder}
              placeholderTextColor="#9CA3AF"
              keyboardType={field.keyboardType ?? "default"}
              value={values[field.key]}
              onChangeText={(text) => onChange(field.key, text)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
