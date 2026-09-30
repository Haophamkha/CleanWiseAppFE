import { useSuccessSheet } from "@/components/common/SuccessSheet";
import { ROUTES } from "@/config/constants";
import {
  saveTokens,
  useLoginMutation,
  useLoginWithGoogleMutation,
} from "@/features/auth/api/authApi";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import type { AuthResponse } from "@/features/auth/types/authResponse";
import { setUser } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast } from "@/utils/toast";
import { loginSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";

export function useLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] =
    useLoginWithGoogleMutation();
  const dispatch = useAppDispatch();
  const { show } = useSuccessSheet();

  // Dùng chung cho đăng nhập thường và Google
  const finishLogin = async (res: AuthResponse) => {
    if (res.user.role !== "CUSTOMER") {
      const msg = "Tài khoản này không dùng được trên ứng dụng khách hàng";
      setError(msg);
      showErrorToast("Đăng nhập thất bại", msg);
      return;
    }
    await saveTokens(res.access, res.refresh); // đợi ghi xong rồi mới đi tiếp
    dispatch(baseApi.util.resetApiState()); // xóa cache của người trước

    // setUser + chuyển trang sau khi popup tự đóng (3s), tránh layout redirect đè lên popup
    const name = [res.user.first_name, res.user.last_name]
      .filter(Boolean)
      .join(" ");
    show({
      title: "Đăng nhập thành công!",
      message: name ? `Chào mừng trở lại, ${name}.` : "Chào mừng bạn trở lại.",
      onClose: () => {
        dispatch(setUser(res.user));
        router.replace(ROUTES.HOME);
      },
    });
  };

  const submit = async () => {
    const result = loginSchema.safeParse({ phone, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    try {
      await finishLogin(await login({ phone, password }).unwrap());
    } catch (e) {
      const message = getApiErrorMessage(
        e,
        "Đăng nhập thất bại, vui lòng thử lại",
      );
      setError(message);
      showErrorToast("Đăng nhập thất bại", message);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setError("");
    try {
      await finishLogin(await loginWithGoogle({ id_token: idToken }).unwrap());
    } catch (e) {
      const message = getApiErrorMessage(
        e,
        "Đăng nhập Google thất bại, vui lòng thử lại",
      );
      setError(message);
      showErrorToast("Đăng nhập Google thất bại", message);
    }
  };

  const { request, promptAsync } = useGoogleAuth(handleGoogleSuccess);

  return {
    phone,
    setPhone,
    password,
    setPassword,
    error,
    isLoading,
    isGoogleLoading,
    googleReady: request,
    submit,
    submitGoogle: () => promptAsync(),
  };
}
