import { ROUTES } from "@/config/constants";
import { saveTokens, useRegisterMutation } from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { registerSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";

const INITIAL_FORM = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  password: "",
  password_confirm: "",
};

export type RegisterFormKey = keyof typeof INITIAL_FORM;

export function useRegister() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  const update = (key: RegisterFormKey, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (!agree) {
      setError("Bạn cần đồng ý điều khoản để tiếp tục");
      return;
    }
    setError("");
    try {
      const res = await register(form).unwrap();
      await saveTokens(res.access, res.refresh);
      dispatch(baseApi.util.resetApiState());
      dispatch(setUser(res.user));
      showSuccessToast(
        "Tạo tài khoản thành công",
        `Chào mừng ${res.user.first_name || ""} đến với CleanWise`,
      );
      router.replace(ROUTES.HOME);
    } catch (e) {
      const message = getApiErrorMessage(
        e,
        "Tạo tài khoản thất bại, vui lòng thử lại",
      );
      setError(message);
      showErrorToast("Không thể tạo tài khoản", message);
    }
  };

  return {
    form,
    update,
    agree,
    toggleAgree: () => setAgree((v) => !v),
    error,
    isLoading,
    submit,
  };
}
