// components/address/DefaultAddressSwitch.tsx
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Switch, Text, View } from "react-native";

interface DefaultAddressSwitchProps {
  isDefault: boolean;
  onValueChange: (value: boolean) => void;
  isCurrentDefault?: boolean;
  isEditMode?: boolean;
}

export default function DefaultAddressSwitch({
  isDefault,
  onValueChange,
  isCurrentDefault = false,
  isEditMode = false,
}: DefaultAddressSwitchProps) {
  // Đã là mặc định thì không tắt trực tiếp được, phải chọn địa chỉ khác làm mặc định
  const locked = isEditMode && isCurrentDefault;
  const active = locked ? true : isDefault;

  return (
    <View className="flex-row items-center bg-canvas border border-line rounded-lg px-4 py-3 mb-6">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          active ? "bg-accent-light" : "bg-surface"
        }`}
      >
        <Feather
          name="star"
          size={18}
          color={active ? COLORS.accent : COLORS.inkMuted}
        />
      </View>
      <View className="flex-1 mr-3">
        <Text className="text-base font-medium text-ink">
          Đặt làm địa chỉ mặc định
        </Text>
        {locked && (
          <Text className="text-xs text-ink-muted mt-0.5">
            Địa chỉ này đang là mặc định. Chọn địa chỉ khác làm mặc định để đổi.
          </Text>
        )}
      </View>
      <Switch
        value={active}
        onValueChange={onValueChange}
        disabled={locked}
        trackColor={{ false: COLORS.line, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );
}
