import { useTranslation } from "react-i18next";

import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyResetOtpMutation,
} from "@/features/auth/api/authApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";
import { getLocalizedForgotPasswordSchema, getLocalizedResetPasswordSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useEffect, useState } from "react";

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;

export type ForgotStep = "request" | "verify" | "reset" | "done";

export function useForgotPassword() {
  const { t } = useTranslation();

  const [step, setStep] = useState<ForgotStep>("request");
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

  const cleanEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (!resendAt) return;
    const tick = () =>
      setCountdown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  const sendCode = async () => {
    const result = getLocalizedForgotPasswordSchema().safeParse({ email: cleanEmail });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await forgotPassword({ email: cleanEmail }).unwrap();
      setStep("verify");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      showSuccessToast(t("Đã gửi mã xác nhận"), t("Kiểm tra email của bạn"));
    } catch (e) {
      setError(getApiErrorMessage(e, t("Không gửi được mã, thử lại sau.")));
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError(t("Mã xác nhận gồm {{value0}} chữ số", { value0: OTP_LENGTH }));
      return;
    }
    setError("");
    try {
      await verifyResetOtp({ email: cleanEmail, code: otp }).unwrap();
      setStep("reset");
    } catch (e) {
      setError(
        getApiErrorMessage(e, t("Mã xác nhận không đúng hoặc đã hết hạn.")),
      );
    }
  };

  const submitNewPassword = async () => {
    const result = getLocalizedResetPasswordSchema().safeParse({
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await resetPassword({
        email: cleanEmail,
        code: otp,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }).unwrap();
      setStep("done");
    } catch (e) {
      setError(getApiErrorMessage(e, t("Đặt lại mật khẩu thất bại, thử lại.")));
    }
  };

  return {
    step,
    error,
    email,
    setEmail,
    otp,
    setOtp: (v: string) => setOtp(v.replace(/\D/g, "").slice(0, OTP_LENGTH)),
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    countdown,
    isSending,
    isVerifying,
    isResetting,
    sendCode,
    verifyOtp,
    submitNewPassword,
    goToLogin: () => router.replace("/(auth)/login"),
  };
}
