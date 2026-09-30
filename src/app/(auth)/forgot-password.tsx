import { Button, ErrorText, Input, PasswordInput } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { AuthCard, AuthHeading } from "@/features/auth/components/AuthCard";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const f = useForgotPassword();

  return (
    <AuthCard>
      {f.step === "request" && (
        <>
          <AuthHeading
            title="Quên mật khẩu?"
            subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu."
          />
          <Input
            label="Email"
            icon="mail"
            placeholder="ban@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={f.email}
            onChangeText={f.setEmail}
          />
          <ErrorText message={f.error} />
          <Button
            title={f.isSending ? "Đang gửi..." : "Gửi mã xác nhận"}
            onPress={f.sendCode}
            disabled={f.isSending}
            className="mt-2"
          />
          <View className="flex-row justify-center mt-8">
            <Link href="/(auth)/login">
              <Text className="text-sm font-semibold text-primary">
                Đăng nhập
              </Text>
            </Link>
          </View>
        </>
      )}

      {f.step === "verify" && (
        <>
          <AuthHeading
            title="Nhập mã xác nhận"
            subtitle={
              <>
                Mã xác nhận đã được gửi tới{" "}
                <Text className="font-medium text-ink">{f.email}</Text>
              </>
            }
          />
          <Input
            label="Mã xác nhận"
            icon="lock"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={f.otp}
            onChangeText={f.setOtp}
          />
          <ErrorText message={f.error} />
          <Button
            title={f.isVerifying ? "Đang xác nhận..." : "Xác nhận"}
            onPress={f.verifyOtp}
            disabled={f.isVerifying}
            className="mt-2"
          />
          <TouchableOpacity
            className="items-center mt-5"
            onPress={f.sendCode}
            disabled={f.countdown > 0 || f.isSending}
          >
            <Text
              className={
                f.countdown > 0
                  ? "text-sm text-ink-muted"
                  : "text-sm font-semibold text-primary"
              }
            >
              {f.countdown > 0
                ? `Gửi lại mã sau ${f.countdown}s`
                : "Gửi lại mã"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {f.step === "reset" && (
        <>
          <AuthHeading
            title="Đặt mật khẩu mới"
            subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
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
            title={f.isResetting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
            onPress={f.submitNewPassword}
            disabled={f.isResetting}
            className="mt-2"
          />
        </>
      )}

      {f.step === "done" && (
        <>
          <View className="w-14 h-14 rounded-full bg-success-light items-center justify-center mb-6">
            <Feather name="check" size={24} color={COLORS.success} />
          </View>
          <AuthHeading
            title="Đổi mật khẩu thành công"
            subtitle="Bạn có thể đăng nhập lại bằng mật khẩu mới."
          />
          <Button title="Quay lại đăng nhập" onPress={f.goToLogin} />
        </>
      )}
    </AuthCard>
  );
}
