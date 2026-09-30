// components/address/AddressCard.tsx
import { Badge, Card, type FeatherName } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import type { Address } from "@/features/address/types/Address";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface AddressCardProps {
  address: Address;
  onEdit: (id: number) => void;
  onSelect?: (address: Address) => void;
}

const iconFor = (label?: string): FeatherName => {
  const t = (label ?? "").toLowerCase();
  if (t.includes("nhà")) return "home";
  if (t.includes("công ty") || t.includes("văn phòng")) return "briefcase";
  return "map-pin";
};

export default function AddressCard({
  address,
  onEdit,
  onSelect,
}: AddressCardProps) {
  return (
    <TouchableOpacity
      disabled={!onSelect}
      activeOpacity={0.85}
      onPress={() => onSelect?.(address)}
    >
      <Card className="mb-3">
        <View className="flex-row items-start">
          <View className="w-11 h-11 rounded-full bg-primary-soft items-center justify-center mr-3">
            <Feather
              name={iconFor(address.label)}
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View className="flex-1 pr-2">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-bold text-ink" numberOfLines={1}>
                {address.label || "Địa chỉ"}
              </Text>
              {address.is_default && (
                <View className="ml-2">
                  <Badge label="Mặc định" tone="primary" />
                </View>
              )}
            </View>
            <Text className="text-sm text-ink mb-0.5">
              {address.receiver_name} · {address.receiver_phone}
            </Text>
            <Text className="text-sm text-ink-soft">
              {address.address_line}, {address.ward}, {address.city}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onEdit(address.id)}
            hitSlop={8}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full bg-canvas items-center justify-center"
          >
            <Feather name="edit-2" size={15} color={COLORS.inkSoft} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
