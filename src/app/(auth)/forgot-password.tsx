import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetOtpMutation,
} from "@/services/authApi";
import { showSuccessToast } from "@/utils/toast";
import { forgotPasswordSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RESEND_SECONDS = 60;

type Step = "request" | "verify" | "reset" | "done";

const getErrorMessage = (err: any, fallback: string) => {
  return err?.data?.message || err?.data?.detail || fallback;
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  useEffect(() => {
    if (!resendAt) return;
    const tick = () => {
      const remain = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setCountdown(remain);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  const handleSendCode = async () => {
    const result = forgotPasswordSchema.safeParse({ contact: email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await forgotPassword({ email }).unwrap();
      setStep("verify");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      showSuccessToast("Đã gửi mã xác nhận", "Kiểm tra email của bạn");
    } catch (err) {
      setError(getErrorMessage(err, "Không gửi được mã, thử lại sau."));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 4) {
      setError("Mã xác nhận không hợp lệ");
      return;
    }
    setError("");
    try {
      await verifyResetOtp({ email, code: otp.trim() }).unwrap();
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    try {
      await resetPassword({
        email,
        code: otp.trim(),
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }).unwrap();
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err, "Đặt lại mật khẩu thất bại, thử lại."));
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF9F5]"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-12"
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-[420px] bg-white rounded-[28px] border border-[#E7E3D8] p-8 sm:p-10">
        {/* Wordmark */}
        <View className="flex-row items-center mb-8">
          <View className="w-9 h-9 rounded-full bg-[#E7EFE9] items-center justify-center mr-3">
            <Feather name="droplet" size={16} color="#1F4D3D" />
          </View>
          <Text className="text-[#1B2420] text-base font-semibold tracking-tight">
            CleanWise
          </Text>
        </View>

        {step === "request" && (
          <>
            <Text className="text-[#1B2420] text-[26px] leading-8 font-semibold mb-2">
              Quên mật khẩu?
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật
              khẩu.
            </Text>

            <Text className="text-[#1B2420] text-sm mb-2">Email</Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-2">
              <Feather name="mail" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="ban@email.com"
                placeholderTextColor="#9A9A8E"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {!!error && (
              <Text className="text-[#B3413B] text-sm mt-2 mb-1">{error}</Text>
            )}

            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 flex-row justify-center items-center mt-5"
              onPress={handleSendCode}
              disabled={isSending}
            >
              <Text className="text-white font-semibold text-[15px] mr-2">
                {isSending ? "Đang gửi..." : "Gửi mã xác nhận"}
              </Text>
              {!isSending && (
                <Feather name="arrow-right" size={17} color="#fff" />
              )}
            </TouchableOpacity>
          </>
        )}

        {step === "verify" && (
          <>
            <Text className="text-[#1B2420] text-[26px] leading-8 font-semibold mb-2">
              Nhập mã xác nhận
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Mã xác nhận đã được gửi tới{" "}
              <Text className="text-[#1B2420] font-medium">{email}</Text>
            </Text>

            <Text className="text-[#1B2420] text-sm mb-2">Mã xác nhận</Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-2">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px] tracking-widest"
                placeholder="000000"
                placeholderTextColor="#9A9A8E"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            {!!error && (
              <Text className="text-[#B3413B] text-sm mt-2 mb-1">{error}</Text>
            )}

            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 items-center mt-5"
              onPress={handleVerifyOtp}
              disabled={isVerifying}
            >
              <Text className="text-white font-semibold text-[15px]">
                {isVerifying ? "Đang xác nhận..." : "Xác nhận"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-5"
              onPress={handleSendCode}
              disabled={countdown > 0 || isSending}
            >
              <Text
                className={
                  countdown > 0
                    ? "text-[#9A9A8E] text-sm"
                    : "text-[#1F4D3D] font-semibold text-sm"
                }
              >
                {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "reset" && (
          <>
            <Text className="text-[#1B2420] text-[26px] leading-8 font-semibold mb-2">
              Đặt mật khẩu mới
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Text>

            <Text className="text-[#1B2420] text-sm mb-2">Mật khẩu mới</Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-4">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#9A9A8E"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <Text className="text-[#1B2420] text-sm mb-2">
              Xác nhận mật khẩu mới
            </Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-2">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#9A9A8E"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {!!error && (
              <Text className="text-[#B3413B] text-sm mt-2 mb-1">{error}</Text>
            )}

            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 items-center mt-5"
              onPress={handleResetPassword}
              disabled={isResetting}
            >
              <Text className="text-white font-semibold text-[15px]">
                {isResetting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "done" && (
          <>
            <View className="w-14 h-14 rounded-full bg-[#E7EFE9] items-center justify-center mb-6">
              <Feather name="check" size={24} color="#1F4D3D" />
            </View>
            <Text className="text-[#1B2420] text-[26px] leading-8 font-semibold mb-2">
              Đổi mật khẩu thành công
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Bạn có thể đăng nhập lại bằng mật khẩu mới.
            </Text>

            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 items-center"
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-white font-semibold text-[15px]">
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "request" && (
          <View className="flex-row justify-center mt-8">
            <Link href="/(auth)/login">
              <Text className="text-[#1F4D3D] font-semibold text-[15px]">
                Đăng nhập
              </Text>
            </Link>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
