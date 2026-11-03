import { ROUTES } from "@/config/constants";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  message?: string;
};

export function RequireLoginNotice({
  message = t("Đăng nhập để xem đầy đủ thông tin của bạn"),
}: Props) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  return (
    <View
      className="bg-surface border border-line items-center mb-6"
      style={[
        { borderRadius: 28, paddingHorizontal: 24, paddingVertical: 28 },
        SHADOWS.card,
      ]}
    >
      <View
        className="bg-primary-light items-center justify-center"
        style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }}
      >
        <Feather name="user" size={32} color={COLORS.primary} />
      </View>
      <Text
        className="font-bold text-ink"
        style={{ fontSize: 20, lineHeight: 26, marginBottom: 6 }}
      >
        {t("Bạn chưa đăng nhập")}
      </Text>
      <Text
        className="text-ink-soft text-center"
        style={{ fontSize: 14, lineHeight: 21 }}
      >
        {message}
      </Text>

      <View className="flex-row w-full" style={{ gap: 12, marginTop: 24 }}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-primary-soft border border-primary-border"
          style={{ borderRadius: 999, height: 50 }}
          onPress={() => router.push(ROUTES.REGISTER as any)}
          activeOpacity={0.8}
        >
          <Text
            className="font-semibold text-primary-dark"
            style={{ fontSize: 15 }}
          >
            {t("Đăng ký")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center"
          style={[
            { borderRadius: 999, height: 50, backgroundColor: COLORS.primary },
            SHADOWS.float,
          ]}
          onPress={() => router.push(ROUTES.LOGIN as any)}
          activeOpacity={0.85}
        >
          <Text
            className="font-semibold"
            style={{ fontSize: 15, color: COLORS.white }}
          >
            {t("Đăng nhập")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
