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
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useProfile();
  const hasPassword = useAppSelector(
    (s) => (s.auth.user as any)?.has_password !== false,
  );
  const { pushEnabled, setPushEnabled } =
    useNotificationPreferences(isAuthenticated);

  const clearCache = () =>
    Alert.alert("Xoá bộ nhớ đệm", "Ảnh và dữ liệu tạm sẽ được xoá.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        onPress: () => {
          // TODO: xoá cache (vd Image.clearDiskCache() của expo-image nếu bạn dùng)
        },
      },
    ]);

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Cài đặt" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
      >
        <MenuGroup title="Thông báo">
          {isAuthenticated && (
            <SwitchRow
              icon="bell"
              label="Thông báo"
              desc="Nhận thông báo từ CleanWise"
              value={pushEnabled}
              onChange={setPushEnabled}
            />
          )}
          <MenuListItem
            icon="external-link"
            label="Cài đặt thông báo hệ thống"
            onPress={() => Linking.openSettings()}
          />
        </MenuGroup>

        {isAuthenticated && hasPassword && (
          <MenuGroup title="Bảo mật">
            <MenuListItem
              icon="key"
              label="Đổi mật khẩu"
              onPress={() => router.push(ROUTES.CHANGE_PASSWORD as any)}
            />
          </MenuGroup>
        )}

        <MenuGroup title="Ứng dụng">
          <MenuListItem
            icon="trash-2"
            label="Xoá bộ nhớ đệm"
            onPress={clearCache}
          />
        </MenuGroup>

        <Text className="text-center text-xs text-ink-muted mt-2">
          CleanWise v{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScrollView>
    </View>
  );
}
