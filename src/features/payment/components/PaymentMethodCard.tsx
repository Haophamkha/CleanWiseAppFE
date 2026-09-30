import { Badge } from "@/components/ui/Badge";
import { COLORS, SHADOWS } from "@/constants/theme";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  method: PaymentMethod;
  disabled: boolean;
  onSetDefault: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
};

export default function PaymentMethodCard({
  method,
  disabled,
  onSetDefault,
  onDelete,
}: Props) {
  const verified = method.verification_status === "VERIFIED";
  const failed = method.verification_status === "FAILED";
  const statusLabel = verified
    ? "Đã xác minh"
    : failed
      ? "Xác minh thất bại"
      : "Chưa xác minh";
  const statusTone = verified ? "success" : failed ? "danger" : "accent";
  const statusIcon = verified ? "check-circle" : failed ? "x-circle" : "clock";
  const statusColor = verified
    ? COLORS.success
    : failed
      ? COLORS.danger
      : COLORS.accentDark;

  return (
    <View
      className={`rounded-3xl border p-5 mb-3 ${
        method.is_default
          ? "bg-primary-soft border-primary-border"
          : "bg-surface border-line"
      }`}
      style={SHADOWS.card}
    >
      <View className="flex-row items-center">
        <View
          className="items-center justify-center rounded-2xl mr-3"
          style={{
            width: 52,
            height: 52,
            backgroundColor: method.is_default
              ? COLORS.primary
              : COLORS.primaryLight,
          }}
        >
          <Feather
            name="credit-card"
            size={24}
            color={method.is_default ? COLORS.white : COLORS.primaryDark}
          />
        </View>

        <View className="flex-1">
          <Text className="text-ink text-base font-bold" numberOfLines={1}>
            {method.display_name || method.bank_name}
          </Text>
          <Text className="text-ink-muted text-xs mt-0.5" numberOfLines={1}>
            {method.account_holder_name}
          </Text>
        </View>

        {method.is_default && (
          <View className="flex-row items-center bg-primary rounded-full px-2.5 py-1 ml-2">
            <Feather name="star" size={11} color={COLORS.white} />
            <Text className="text-white text-[11px] font-bold ml-1">
              Mặc định
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between mt-4 rounded-2xl bg-surface border border-line px-4 py-3">
        <Text className="text-ink text-lg font-bold tracking-widest">
          {method.account_number_masked}
        </Text>
        <View className="flex-row items-center">
          <Feather name={statusIcon} size={14} color={statusColor} />
          <View className="ml-1.5">
            <Badge label={statusLabel} tone={statusTone} />
          </View>
        </View>
      </View>

      <View className="flex-row mt-4" style={{ gap: 10 }}>
        {!method.is_default && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center h-11 rounded-full bg-primary-light"
            onPress={() => onSetDefault(method)}
            disabled={disabled}
            activeOpacity={0.8}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <Feather name="check-circle" size={16} color={COLORS.primaryDark} />
            <Text className="text-primary-dark font-bold ml-2">
              Đặt mặc định
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`${
            method.is_default ? "flex-1" : "px-5"
          } flex-row items-center justify-center h-11 rounded-full bg-danger-light`}
          onPress={() => onDelete(method)}
          disabled={disabled}
          activeOpacity={0.8}
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <Feather name="trash-2" size={16} color={COLORS.danger} />
          <Text className="text-danger font-bold ml-2">Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
