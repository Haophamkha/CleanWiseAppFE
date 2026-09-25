import type { PaymentMethod } from "@/types/PaymentMethod";
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
  const statusBackground = verified
    ? "#ECFDF5"
    : failed
      ? "#FEF2F2"
      : "#FFFBEB";
  const statusColor = verified ? "#047857" : failed ? "#DC2626" : "#B45309";

  return (
    <View
      className="bg-white rounded-3xl border border-gray-100 p-5 mb-3"
      style={{
        shadowColor: "#0F172A",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-start">
        <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mr-3">
          <Feather name="credit-card" size={21} color="#047857" />
        </View>
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center">
            <Text className="text-gray-900 text-base font-bold mr-2">
              {method.display_name || method.bank_name}
            </Text>
            {method.is_default && (
              <View className="bg-emerald-700 rounded-full px-2.5 py-1">
                <Text className="text-white text-xs font-semibold">
                  Mặc định
                </Text>
              </View>
            )}
          </View>
          <Text className="text-gray-700 font-semibold tracking-wider mt-1">
            {method.account_number_masked}
          </Text>
          <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
            {method.account_holder_name}
          </Text>
          <View className="flex-row mt-3">
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: statusBackground }}
            >
              <Text className="text-xs font-medium" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row border-t border-gray-100 mt-4 pt-3">
        {!method.is_default && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-1"
            onPress={() => onSetDefault(method)}
            disabled={disabled}
          >
            <Feather name="check-circle" size={16} color="#047857" />
            <Text className="text-emerald-700 font-semibold ml-2">
              Đặt mặc định
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`${method.is_default ? "flex-1" : "ml-3 pl-4 border-l border-gray-100"} flex-row items-center justify-center py-1`}
          onPress={() => onDelete(method)}
          disabled={disabled}
        >
          <Feather name="trash-2" size={16} color="#DC2626" />
          <Text className="text-red-600 font-semibold ml-2">Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
