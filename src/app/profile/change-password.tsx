import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button, ErrorText, PasswordInput } from "@/components/ui";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const f = useChangePassword();

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Đổi mật khẩu" disabled={f.isLoading} />
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
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            value={f.oldPassword}
            onChangeText={f.setOldPassword}
          />
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
            value={f.newPassword}
            onChangeText={f.setNewPassword}
          />
          <PasswordInput
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={f.confirmPassword}
            onChangeText={f.setConfirmPassword}
          />
          <ErrorText message={f.error} />
          <Button
            title={f.isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
            onPress={f.submit}
            disabled={f.isLoading}
            className="mt-2"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
