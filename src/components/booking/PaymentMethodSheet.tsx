import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import type {
    PaymentMethodValue,
    PaymentOption,
} from "@/features/booking/hooks/useBookingConfirm";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  value: PaymentMethodValue;
  options: PaymentOption[];
  onSelect: (value: PaymentMethodValue) => void;
  onClose: () => void;
};

export function PaymentMethodSheet({
  visible,
  value,
  options,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: OVERLAY,
          justifyContent: "flex-end",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            className="bg-surface px-5"
            style={{
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-line" />
            </View>
            <Text className="text-base font-bold text-ink text-center py-3">
              Phương thức thanh toán
            </Text>

            {options.map((m) => {
              const selected = m.value === value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => onSelect(m.value)}
                  activeOpacity={0.8}
                  className={`flex-row items-center rounded-2xl border p-4 mb-3 ${
                    selected
                      ? "bg-primary-soft border-primary"
                      : "bg-surface border-line"
                  }`}
                >
                  <View
                    className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${
                      selected ? "bg-primary" : "bg-canvas"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={m.icon as any}
                      size={22}
                      color={selected ? COLORS.white : COLORS.inkSoft}
                    />
                  </View>
                  <Text
                    className={`flex-1 text-[15px] font-semibold ${
                      selected ? "text-primary-dark" : "text-ink"
                    }`}
                  >
                    {m.label}
                  </Text>
                  {selected && (
                    <Feather
                      name="check-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
