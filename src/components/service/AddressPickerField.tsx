import type { Address } from "@/types/Address";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "./formFieldShared";

export function AddressPickerField({
  label,
  required,
  value,
  onPress,
}: {
  label: string;
  required?: boolean;
  value?: Address;
  onPress: () => void;
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-2">
        <Text className="font-bold text-[16px]" style={{ color: COLORS.text }}>
          {label}
        </Text>
        {required && (
          <Text className="ml-1" style={{ color: COLORS.danger }}>
            *
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="rounded-2xl px-4 py-4"
        style={{
          borderWidth: 1,
          borderColor: value ? COLORS.primary : COLORS.border,
          backgroundColor: value ? COLORS.primaryLight : COLORS.white,
        }}
      >
        {value ? (
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center mb-1">
                <Feather
                  name="map-pin"
                  size={14}
                  color={COLORS.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className="font-bold text-[14px]"
                  style={{ color: COLORS.primary }}
                >
                  {value.label || "Địa chỉ"}
                </Text>
              </View>
              <Text
                className="text-[13px]"
                style={{ color: COLORS.textSecondary }}
              >
                {value.receiver_name} · {value.receiver_phone}
              </Text>
              <Text
                className="text-[13px] mt-0.5"
                style={{ color: COLORS.textMuted }}
                numberOfLines={2}
              >
                {value.address_line}, {value.ward}, {value.city}
              </Text>
            </View>
            <Text
              className="text-[13px] font-bold"
              style={{ color: COLORS.primary }}
            >
              Đổi
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Feather
                name="map-pin"
                size={16}
                color={COLORS.textMuted}
                style={{ marginRight: 8 }}
              />
              <Text className="text-[15px]" style={{ color: COLORS.textMuted }}>
                Chọn địa chỉ
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
