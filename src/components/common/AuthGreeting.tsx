import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ROUTES } from "@/config/constants";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function AuthGreeting() {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  const displayName = user
    ? `${user.last_name ?? ""} ${user.first_name ?? ""}`.trim() ||
      user.username ||
      t("Bạn")
    : t("Khách");

  return (
    <View className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5 mb-4 shadow-sm">
      {isAuthenticated ? (
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-ink-soft text-xs font-medium uppercase tracking-wider">
              {t("Xin chào trở lại 👋")}</Text>
            <Text
              className="text-lg font-bold text-ink mt-1"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-emerald-100 items-center justify-center">
            <Feather name="smile" size={22} color={COLORS.success} />
          </View>
        </View>
      ) : (
        <View>
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
              <Feather name="user" size={20} color={COLORS.success} />
            </View>
            <View className="flex-1">
              <Text className="text-ink-soft text-xs">
                {t("Chào mừng bạn đến với CleanWise")}</Text>
              <Text className="text-base font-bold text-ink">
                {t("Đăng nhập để trải nghiệm ngay")}</Text>
            </View>
          </View>

          {/* Hai nút Đăng nhập & Đăng ký nằm cạnh nhau */}
          <View className="flex-row space-x-3 mt-1" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 bg-emerald-700 rounded-xl py-3 items-center shadow-sm"
              onPress={() => router.push(ROUTES.LOGIN as any)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">{t("Đăng nhập")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-surface border border-emerald-700 rounded-xl py-3 items-center"
              onPress={() => router.push(ROUTES.REGISTER as any)}
              activeOpacity={0.8}
            >
              <Text className="text-emerald-700 font-bold text-sm">
                {t("Đăng ký")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
