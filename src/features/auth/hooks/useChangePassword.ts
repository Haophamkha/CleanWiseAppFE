import { useChangePasswordMutation } from "@/features/auth/api/authApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showSuccessToast } from "@/utils/toast";
import { resetPasswordSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";

export function useChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!oldPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    const result = resetPasswordSchema.safeParse({
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (newPassword === oldPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại");
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
        "Đổi mật khẩu thành công",
        "Lần đăng nhập sau hãy dùng mật khẩu mới",
      );
      router.back();
    } catch (e) {
      setError(getApiErrorMessage(e, "Đổi mật khẩu thất bại, thử lại."));
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
