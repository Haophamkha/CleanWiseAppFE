import { Button, ErrorText, Input, PasswordInput } from "@/components/ui";
import { AuthCard, AuthHeading } from "@/features/auth/components/AuthCard";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { Link, router } from "expo-router";
import { Text, View } from "react-native";

export default function LoginScreen() {
  const {
    phone,
    setPhone,
    password,
    setPassword,
    error,
    isLoading,
    isGoogleLoading,
    googleReady,
    submit,
    submitGoogle,
  } = useLogin();

  return (
    <AuthCard onBack={() => router.replace("/")}>
      <AuthHeading
        title="Chào bạn quay lại"
        subtitle="Đăng nhập để tiếp tục đặt lịch dọn dẹp cho nhà bạn."
      />

      <Input
        label="Số điện thoại"
        icon="phone"
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <PasswordInput
        label="Mật khẩu"
        labelRight={
          <Link href="/(auth)/forgot-password">
            <Text className="text-sm font-medium text-primary">
              Quên mật khẩu?
            </Text>
          </Link>
        }
        placeholder="Nhập mật khẩu của bạn"
        value={password}
        onChangeText={setPassword}
      />

      <ErrorText message={error} />

      <Button
        title={isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        onPress={submit}
        disabled={isLoading}
        className="mt-2"
      />

      <View className="flex-row items-center my-7">
        <View className="flex-1 h-px bg-line" />
        <Text className="mx-3 text-sm text-ink-muted">Hoặc tiếp tục với</Text>
        <View className="flex-1 h-px bg-line" />
      </View>

      <GoogleButton
        onPress={submitGoogle}
        disabled={!googleReady}
        loading={isGoogleLoading}
      />

      <View className="flex-row justify-center mt-8">
        <Text className="text-sm text-ink-soft">Chưa có tài khoản? </Text>
        <Link href="/(auth)/register">
          <Text className="text-sm font-semibold text-primary">Đăng ký</Text>
        </Link>
      </View>
    </AuthCard>
  );
}
