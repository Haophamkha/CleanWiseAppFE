import { useTranslation } from "react-i18next";

import { useChangePasswordMutation } from "@/features/auth/api/authApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";
import { getLocalizedResetPasswordSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";

export function useChangePassword() {
  const { t } = useTranslation();

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!oldPassword) {
      setError(t("Vui lòng nhập mật khẩu hiện tại"));
      return;
    }
    const result = getLocalizedResetPasswordSchema().safeParse({
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (newPassword === oldPassword) {
      setError(t("Mật khẩu mới phải khác mật khẩu hiện tại"));
      return;
    }
    setError("");
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }).unwrap();
      showSuccessToast(
        t("Đổi mật khẩu thành công"),
        t("Lần đăng nhập sau hãy dùng mật khẩu mới"),
      );
      router.back();
    } catch (e) {
      setError(getApiErrorMessage(e, t("Đổi mật khẩu thất bại, thử lại.")));
    }
  };

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    submit,
  };
}
