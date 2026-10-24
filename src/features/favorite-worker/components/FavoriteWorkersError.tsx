import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function FavoriteWorkersError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-danger-light items-center justify-center">
        <Feather name="wifi-off" size={28} color={COLORS.danger} />
      </View>
      <Text className="text-ink font-bold text-base mt-4">
        {t("Không tải được danh sách")}</Text>
      <Text className="text-ink-muted text-sm text-center mt-2">
        {t("Kiểm tra kết nối mạng và thử lại nhé.")}</Text>
      <TouchableOpacity
        className="bg-primary-fill rounded-xl px-6 py-3 mt-5"
        onPress={onRetry}
      >
        <Text className="text-white font-bold">{t("Thử lại")}</Text>
      </TouchableOpacity>
    </View>
  );
}
