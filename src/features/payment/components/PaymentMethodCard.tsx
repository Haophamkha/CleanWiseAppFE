import { useTranslation } from "react-i18next";

import { ON_DARK } from "@/constants/theme";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  const { COLORS, GRADIENTS, SHADOWS } = useAppTheme();

  const verified = method.verification_status === "VERIFIED";
  const sandboxVerified = method.verification_status === "SANDBOX_VERIFIED";
  const failed = method.verification_status === "FAILED";
  const pending = method.verification_status === "PENDING";

  const statusLabel = verified
    ? t("\u0110\u00e3 x\u00e1c minh")
    : sandboxVerified
      ? t("Ch\u01b0a d\u00f9ng \u0111\u1ec3 r\u00fat ti\u1ec1n")
      : failed
        ? t("X\u00e1c minh th\u1ea5t b\u1ea1i")
        : pending
          ? t("\u0110ang x\u00e1c minh")
          : t("Ch\u01b0a x\u00e1c minh");
  const statusIcon = verified ? "check-circle" : failed ? "x-circle" : "clock";
  const statusColor = verified ? COLORS.success : failed ? COLORS.danger : COLORS.accentDark;
  const statusBg = verified ? COLORS.successLight : failed ? COLORS.dangerLight : COLORS.accentLight;

  const verifyLabel = pending
    ? t("Ti\u1ebfp t\u1ee5c x\u00e1c minh")
    : sandboxVerified
      ? t("X\u00e1c minh l\u1ea1i")
      : t("X\u00e1c minh");

  const softBtn = {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: 44,
    borderRadius: 999,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <View
      style={[
        { marginBottom: 16, borderRadius: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line },
        SHADOWS.card,
      ]}
    >
      <View style={{ borderRadius: 23, overflow: "hidden" }}>
        <LinearGradient
          colors={GRADIENTS.wallet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 18 }}
        >
          <View pointerEvents="none" style={{ position: "absolute", width: 150, height: 150, borderRadius: 75, right: -40, top: -50, backgroundColor: ON_DARK.surface }} />
          <View pointerEvents="none" style={{ position: "absolute", width: 90, height: 90, borderRadius: 45, left: -30, bottom: -40, backgroundColor: ON_DARK.surface }} />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: ON_DARK.surface, borderWidth: 1, borderColor: ON_DARK.border }}>
              <Feather name="credit-card" size={20} color={ON_DARK.text} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "800", color: ON_DARK.text }}>
                {method.display_name || method.bank_name}
              </Text>
              <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 12, fontWeight: "600", color: ON_DARK.textSoft, textTransform: "uppercase" }}>
                {method.account_holder_name}
              </Text>
            </View>
            {method.is_default && (
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: ON_DARK.surface, borderWidth: 1, borderColor: ON_DARK.border }}>
                <Feather name="star" size={11} color={ON_DARK.text} />
                <Text style={{ marginLeft: 4, fontSize: 11, fontWeight: "700", color: ON_DARK.text }}>
                  {t("M\u1eb7c \u0111\u1ecbnh")}
                </Text>
              </View>
            )}
          </View>

          <Text numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 18, fontSize: 22, fontWeight: "800", letterSpacing: 2.5, color: ON_DARK.text }}>
            {method.account_number_masked}
          </Text>
        </LinearGradient>

        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: statusBg }}>
            <Feather name={statusIcon} size={15} color={statusColor} />
            <Text style={{ flex: 1, marginLeft: 8, fontSize: 12.5, fontWeight: "700", color: statusColor }}>
              {statusLabel}
            </Text>
          </View>

          {/* row-vd */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>

          {!verified && (
            <TouchableOpacity
              onPress={() => onVerify(method)}
              disabled={disabled}
              activeOpacity={0.85}
              style={[softBtn, { backgroundColor: COLORS.primaryFill }]}
            >
              <Feather name={pending ? "refresh-cw" : "shield"} size={16} color={COLORS.white} />
              <Text numberOfLines={1} style={{ marginLeft: 8, fontSize: 14, fontWeight: "700", color: COLORS.white }}>
                {verifyLabel}
              </Text>
            </TouchableOpacity>
          )}
            <TouchableOpacity
              onPress={() => onDelete(method)}
              disabled={disabled}
              activeOpacity={0.8}
              style={[softBtn, { backgroundColor: COLORS.dangerLight }]}
            >
              <Feather name="trash-2" size={15} color={COLORS.danger} />
              <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: "700", color: COLORS.danger }}>
                {t("X\u00f3a")}
              </Text>
            </TouchableOpacity>
          </View>
          {!method.is_default && (<View style={{ flexDirection: "row", marginTop: 8 }}>
            
              <TouchableOpacity
                onPress={() => onSetDefault(method)}
                disabled={disabled}
                activeOpacity={0.8}
                style={[softBtn, { backgroundColor: COLORS.primaryLight }]}
              >
                <Feather name="check-circle" size={15} color={COLORS.primaryDark} />
                <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 13, fontWeight: "700", color: COLORS.primaryDark }}>
                  {t("\u0110\u1eb7t m\u1eb7c \u0111\u1ecbnh")}
                </Text>
              </TouchableOpacity>
            </View>)}
        </View>
      </View>
    </View>
  );
}