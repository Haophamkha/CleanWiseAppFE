import { safePush } from "@/utils/navigation";
import { useTranslation } from "react-i18next";
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
import { Image, Linking, ScrollView, Text, View } from "react-native";
import { Alert } from "@/components/common/AppAlert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppearanceSettings } from "@/features/theme/AppearanceSettings";
import { LanguageSettings } from "@/features/language/LanguageSettings";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

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
          {isAuthenticated && hasPassword && <MenuListItem icon="key" label={t("Đổi mật khẩu")}
            onPress={() => safePush(ROUTES.CHANGE_PASSWORD as any)} />}
          <MenuListItem icon="external-link" label={t("Cài đặt thông báo hệ thống")} onPress={() => Linking.openSettings()} />
          <MenuListItem
            icon="trash-2"
            label={t("Xoá bộ nhớ đệm")}
            onPress={clearCache}
          />
        </MenuGroup>

        <View style={{ alignItems: "center", marginTop: 8, paddingVertical: 20 }}>
          <Image
            source={require("@assets/images/logo-mark.png")}
            style={[{ width: 72, height: 72, borderRadius: 26 }, SHADOWS.float]}
          />
          <Text style={{ marginTop: 14, fontSize: 20, fontWeight: "800", letterSpacing: -0.2, color: COLORS.ink }}>
            CleanWise
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: COLORS.inkSoft }}>
            {t("Nh\u00e0 s\u1ea1ch, s\u1ed1ng th\u1ea3nh th\u01a1i")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.line,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: COLORS.primary }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.inkSoft }}>
              {t("Phi\u00ean b\u1ea3n")} {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
