import { useTranslation } from "react-i18next";

import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button, ErrorText, PasswordInput } from "@/components/ui";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();
  const f = useChangePassword();

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader title={t("Đổi mật khẩu")} disabled={f.isLoading} />
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <PasswordInput
            label={t("Mật khẩu hiện tại")}
            placeholder={t("Nhập mật khẩu hiện tại")}
            value={f.oldPassword}
            onChangeText={f.setOldPassword}
          />
          <PasswordInput
            label={t("Mật khẩu mới")}
            placeholder={t("Tối thiểu 8 ký tự, có chữ hoa và số")}
            value={f.newPassword}
            onChangeText={f.setNewPassword}
          />
          <PasswordInput
            label={t("Xác nhận mật khẩu mới")}
            placeholder={t("Nhập lại mật khẩu mới")}
            value={f.confirmPassword}
            onChangeText={f.setConfirmPassword}
          />
          <ErrorText message={f.error} />
          <Button
            title={f.isLoading ? t("Đang cập nhật...") : t("Đổi mật khẩu")}
            onPress={f.submit}
            disabled={f.isLoading}
            className="mt-2"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
