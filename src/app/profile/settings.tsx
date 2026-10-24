import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/features/theme/ThemeProvider";

import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SwitchRow } from "@/components/common/SwitchRow";
import { ROUTES } from "@/config/constants";
import { useNotificationPreferences } from "@/features/notification/hooks/useNotificationPreferences";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useAppSelector } from "@/store/hooks";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppearanceSettings } from "@/features/theme/AppearanceSettings";
import { LanguageSettings } from "@/features/language/LanguageSettings";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const [showMore, setShowMore] = useState(false);

  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useProfile();
  const hasPassword = useAppSelector(
    (s) => (s.auth.user as any)?.has_password !== false,
  );
  const { pushEnabled, setPushEnabled } =
    useNotificationPreferences(isAuthenticated);

  const clearCache = () =>
    Alert.alert(t("Xoá bộ nhớ đệm"), t("Ảnh và dữ liệu tạm sẽ được xoá."), [
      { text: t("Huỷ"), style: "cancel" },
      {
        text: t("Xoá"),
        onPress: () => {
          // TODO: xoá cache (vd Image.clearDiskCache() của expo-image nếu bạn dùng)
        },
      },
    ]);

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-canvas" style={{ paddingTop: insets.top + 8 }}>
        <ScreenHeader title={t("Cài đặt")} minimal />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
      >
        <AppearanceSettings />

        <MenuGroup title={t("Tùy chọn ứng dụng")}>
          {isAuthenticated ? (
            <SwitchRow
              icon="bell"
              label={t("Thông báo đẩy")}
              desc={t("Cập nhật về đơn dịch vụ của bạn")}
              value={pushEnabled}
              onChange={setPushEnabled}
            />
          ) : (
            <MenuListItem icon="bell" label={t("Thông báo đẩy")} onPress={() => Linking.openSettings()} />
          )}
          <LanguageSettings compact />
        </MenuGroup>

        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showMore }}
          onPress={() => setShowMore(!showMore)} className="flex-row items-center px-1 py-2 mb-3">
          <Text className="flex-1 text-xs text-ink-muted">{t("Cài đặt khác")}</Text>
          <Feather name={showMore ? "chevron-up" : "chevron-down"} size={16} color={COLORS.inkMuted} />
        </TouchableOpacity>
        {showMore && <MenuGroup>
          {isAuthenticated && hasPassword && <MenuListItem icon="key" label={t("Đổi mật khẩu")}
            onPress={() => router.push(ROUTES.CHANGE_PASSWORD as any)} />}
          <MenuListItem icon="external-link" label={t("Cài đặt thông báo hệ thống")} onPress={() => Linking.openSettings()} />
          <MenuListItem
            icon="trash-2"
            label={t("Xoá bộ nhớ đệm")}
            onPress={clearCache}
          />
        </MenuGroup>}

        <View className="items-center mt-2">
          <Text className="text-sm font-semibold text-primary">CleanWise</Text>
          <Text className="text-xs text-ink-muted mt-1">{t("Nhà sạch, sống thảnh thơi")}</Text>
          {showMore && <Text className="text-xs text-ink-muted mt-2">v{Constants.expoConfig?.version ?? "1.0.0"}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}
