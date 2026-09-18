import { Address } from "@/types/Address";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface AddressCardProps {
  address: Address;
  onEdit: (id: number) => void;
  onSelect?: (address: Address) => void;
}

export default function AddressCard({
  address,
  onEdit,
  onSelect,
}: AddressCardProps) {
  const Wrapper = onSelect ? TouchableOpacity : View;

  return (
    <Wrapper
      {...(onSelect
        ? { activeOpacity: 0.8, onPress: () => onSelect(address) }
        : {})}
      className="border border-gray-200 rounded-xl p-4 mb-3 bg-white"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-1">
            <Text className="font-bold text-gray-900 text-base">
              {address.label}
            </Text>
            {address.is_default && (
              <View className="ml-2 px-2 py-0.5 bg-emerald-50 rounded-full">
                <Text className="text-emerald-700 text-xs font-medium">
                  Mặc định
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-700 text-sm mb-1">
            {address.receiver_name} · {address.receiver_phone}
          </Text>
          <Text className="text-gray-500 text-sm">
            {address.address_line}, {address.ward}, {address.city}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onEdit(address.id)}
          className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center"
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
}
