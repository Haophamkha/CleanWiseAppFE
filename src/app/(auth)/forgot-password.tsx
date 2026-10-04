import { useSuccessSheet } from "@/components/common/SuccessSheet";
import { COLORS } from "@/constants/theme";
import {
  AuthScreen,
  PillButton,
  PillInput,
} from "@/features/auth/components/AuthKit";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { Link, router } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const STEP_INDEX = { request: 0, verify: 1, reset: 2, done: 2 } as const;

function StepBar({ current }: { current: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            marginHorizontal: 4,
            backgroundColor: i <= current ? COLORS.primary : COLORS.line,
          }}
        />
      ))}
    </View>
  );
}

function ErrorLine({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Text
      style={{
        fontSize: 13,
        color: COLORS.danger,
        marginBottom: 12,
        textAlign: "center",
      }}
    >
      {message}
    </Text>
  );
}

export default function ForgotPasswordScreen() {
  const f = useForgotPassword();
  const { show } = useSuccessSheet();

  // Đổi mật khẩu xong: hiện sheet thành công, đóng xong mới về đăng nhập
  const goToLoginRef = useRef(f.goToLogin);
  goToLoginRef.current = f.goToLogin;
  const shown = useRef(false);

  useEffect(() => {
    if (f.step === "done" && !shown.current) {
      shown.current = true;
      show({
        title: "Đổi mật khẩu thành công!",
        message: "Bạn có thể đăng nhập lại bằng mật khẩu mới.",
        onClose: () => goToLoginRef.current(),
      });
    }
  }, [f.step, show]);

  const stepIndex = STEP_INDEX[f.step as keyof typeof STEP_INDEX] ?? 0;

  /* ---------------- Bước 1: nhập email ---------------- */
  if (f.step === "request") {
    return (
      <AuthScreen
        icon="key"
        title="Quên mật khẩu?"
        subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu."
        onBack={() => router.back()}
        footer={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: COLORS.inkSoft }}>
              Nhớ mật khẩu rồi?{" "}
            </Text>
            <Link href="/(auth)/login">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: COLORS.primary,
                }}
              >
                Đăng nhập
              </Text>
            </Link>
          </View>
        }
      >
        <StepBar current={stepIndex} />
        <PillInput
          icon="mail"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={f.email}
          onChangeText={f.setEmail}
        />
        <ErrorLine message={f.error} />
        <PillButton
          title={f.isSending ? "Đang gửi..." : "Gửi mã xác nhận"}
          onPress={f.sendCode}
          loading={f.isSending}
        />
      </AuthScreen>
    );
  }

  /* ---------------- Bước 2: nhập OTP ---------------- */
  if (f.step === "verify") {
    return (
      <AuthScreen
        icon="mail"
        title="Nhập mã xác nhận"
        subtitle={`Mã xác nhận đã được gửi tới ${f.email}`}
        onBack={() => router.back()}
      >
        <StepBar current={stepIndex} />
        <OtpInput value={f.otp} onChange={f.setOtp} invalid={!!f.error} />
        <ErrorLine message={f.error} />
        <PillButton
          title={f.isVerifying ? "Đang xác nhận..." : "Xác nhận"}
          onPress={f.verifyOtp}
          loading={f.isVerifying}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 14, color: COLORS.inkSoft }}>
            Không nhận được mã?{" "}
          </Text>
          <TouchableOpacity
            onPress={f.sendCode}
            disabled={f.countdown > 0 || f.isSending}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: f.countdown > 0 ? COLORS.inkMuted : COLORS.primary,
              }}
            >
              {f.countdown > 0 ? `Gửi lại sau ${f.countdown}s` : "Gửi lại mã"}
            </Text>
          </TouchableOpacity>
        </View>
      </AuthScreen>
    );
  }

  /* ---------------- Bước 3: mật khẩu mới (và nền phía sau sheet "done") ---------------- */
  const mismatch =
    f.confirmPassword.length > 0 && f.newPassword !== f.confirmPassword;

  return (
    <AuthScreen
      icon="lock"
      title="Đặt mật khẩu mới"
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
      onBack={() => router.back()}
    >
      <StepBar current={stepIndex} />
      <PillInput
        icon="lock"
        placeholder="Mật khẩu mới"
        password
        autoCapitalize="none"
        value={f.newPassword}
        onChangeText={f.setNewPassword}
      />
      <Text
        style={{
          marginTop: -6,
          marginBottom: 14,
          paddingHorizontal: 6,
          fontSize: 12,
          color: COLORS.inkMuted,
        }}
      >
        Tối thiểu 8 ký tự, có chữ hoa và số
      </Text>

      <PillInput
        icon="lock"
        placeholder="Xác nhận mật khẩu mới"
        password
        autoCapitalize="none"
        invalid={mismatch}
        value={f.confirmPassword}
        onChangeText={f.setConfirmPassword}
      />
      {mismatch && (
        <Text
          style={{
            marginTop: -6,
            marginBottom: 10,
            paddingHorizontal: 6,
            fontSize: 12,
            color: COLORS.danger,
          }}
        >
          Mật khẩu xác nhận chưa khớp
        </Text>
      )}

      <ErrorLine message={f.error} />
      <PillButton
        title={f.isResetting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        onPress={f.submitNewPassword}
        loading={f.isResetting}
      />
    </AuthScreen>
  );
}
