import { ROUTES } from "@/config/constants";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import {
  saveTokens,
  useLoginMutation,
  useLoginWithGoogleMutation,
} from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import type { AuthResponse } from "@/types/Response";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
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
    dispatch(setUser(res.user));
    showSuccessToast(
      "Đăng nhập thành công",
      `Chào mừng trở lại, ${res.user.first_name || ""}`,
    );
    router.replace(ROUTES.HOME);
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
