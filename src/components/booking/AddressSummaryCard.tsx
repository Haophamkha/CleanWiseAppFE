import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

// Type tối thiểu — không import trực tiếp Address hay BookingAddress để
// component này dùng chung được cho cả trước-khi-đặt (Address, từ
// bookingDraftSlice) lẫn sau-khi-đặt (BookingAddress, từ API booking detail).
// Cả 2 type đó đều có sẵn các field dưới đây nên compatible tự nhiên.
type AddressLike = {
  label?: string | null;
  address_line: string;
  ward?: string | null;
  city: string;
  receiver_name: string;
  receiver_phone: string;
};

export function AddressSummaryCard({ address }: { address: AddressLike }) {
  return (
    <View
      className="rounded-2xl px-4 py-4"
      style={{
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <View className="flex-row items-start mb-4">
        <Feather
          name="map-pin"
          size={18}
          color={COLORS.primary}
          style={{ marginTop: 2, marginRight: 10 }}
        />
        <View className="flex-1">
          <Text
            className="font-bold text-[15px]"
            style={{ color: COLORS.text }}
          >
            {address.label || "Địa chỉ"}
          </Text>
          <Text
            className="text-[13px] mt-1"
            style={{ color: COLORS.textMuted }}
          >
            {address.address_line}
            {address.ward ? `, ${address.ward}` : ""}, {address.city}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-start flex-1">
          <Feather
            name="user"
            size={18}
            color={COLORS.primary}
            style={{ marginTop: 2, marginRight: 10 }}
          />
          <View>
            <Text
              className="font-bold text-[15px]"
              style={{ color: COLORS.text }}
            >
              {address.receiver_name}
            </Text>
            <Text
              className="text-[13px] mt-1"
              style={{ color: COLORS.textMuted }}
            >
              {address.receiver_phone}
            </Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={8}>
          <Feather name="edit-3" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
