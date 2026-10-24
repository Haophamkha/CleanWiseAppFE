import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Badge } from "@/components/ui/Badge";
import { SHADOWS } from "@/constants/theme";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  method: PaymentMethod;
  disabled: boolean;
  onSetDefault: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onVerify: (method: PaymentMethod) => void;
};

export default function PaymentMethodCard({
  method,
  disabled,
  onSetDefault,
  onDelete,
  onVerify,
}: Props) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const verified = method.verification_status === "VERIFIED";
  const sandboxVerified = method.verification_status === "SANDBOX_VERIFIED";
  const failed = method.verification_status === "FAILED";
  const pending = method.verification_status === "PENDING";
  const statusLabel = verified
    ? t("Đã xác minh")
    : sandboxVerified
      ? t("Đã test Sandbox · chưa dùng để rút tiền")
    : failed
      ? t("Xác minh thất bại")
      : pending ? t("Đang xác minh") : t("Chưa xác minh");
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
              ? COLORS.primaryFill
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
          <View className="flex-row items-center bg-primary-fill rounded-full px-2.5 py-1 ml-2">
            <Feather name="star" size={11} color={COLORS.white} />
            <Text className="text-white text-[11px] font-bold ml-1">
              {t("Mặc định")}</Text>
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
        {!verified && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center h-11 rounded-full bg-primary-light"
            onPress={() => onVerify(method)}
            disabled={disabled}
            activeOpacity={0.8}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <Feather name={pending ? "refresh-cw" : "shield"} size={16} color={COLORS.primaryDark} />
            <Text className="text-primary-dark font-bold ml-2">
              {pending ? t("Tiếp tục xác minh") : sandboxVerified ? t("Test lại Sandbox") : t("Xác minh Sandbox TINGEE")}
            </Text>
          </TouchableOpacity>
        )}
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
              {t("Đặt mặc định")}</Text>
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
          <Text className="text-danger font-bold ml-2">{t("Xóa")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
