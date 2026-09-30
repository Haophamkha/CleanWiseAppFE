import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

// Type tối thiểu để dùng chung cho Address (trước khi đặt) và BookingAddress (sau khi đặt)
type AddressLike = {
  label?: string | null;
  address_line: string;
  ward?: string | null;
  city: string;
  receiver_name: string;
  receiver_phone: string;
};

export function AddressSummaryCard({
  address,
  onEdit,
}: {
  address: AddressLike;
  onEdit?: () => void;
}) {
  return (
    <View
      className="rounded-3xl bg-surface border border-line p-4"
      style={SHADOWS.card}
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center mr-3">
          <Feather name="map-pin" size={18} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[15px] text-ink">
            {address.label || "Địa chỉ"}
          </Text>
          <Text className="text-[13px] leading-5 mt-0.5 text-ink-soft">
            {address.address_line}
            {address.ward ? `, ${address.ward}` : ""}, {address.city}
          </Text>
        </View>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={8}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full bg-canvas items-center justify-center ml-2"
          >
            <Feather name="edit-3" size={15} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center rounded-2xl bg-canvas px-3 py-2.5 mt-3">
        <Feather name="user" size={15} color={COLORS.inkMuted} />
        <Text className="text-[13px] font-semibold text-ink ml-2">
          {address.receiver_name}
        </Text>
        <View className="w-1 h-1 rounded-full bg-ink-muted mx-2" />
        <Text className="text-[13px] text-ink-soft flex-1" numberOfLines={1}>
          {address.receiver_phone}
        </Text>
      </View>
    </View>
  );
}
