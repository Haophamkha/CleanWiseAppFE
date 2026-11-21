import { useTranslation } from "react-i18next";

import { storage } from "@/utils/storage";
import { ROUTES, STORAGE_KEYS } from "@/config/constants";
import {
  saveTokens,
  useLoginMutation,
  useLoginWithGoogleMutation,
  useLazyGetProfileQuery,
} from "@/features/auth/api/authApi";
import { useGoogleAuth } from "@/features/auth/hooks/useGoogleAuth";
import type { AuthResponse } from "@/features/auth/types/authResponse";
import { setUser } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import { useAppDispatch } from "@/store/hooks";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast } from "@/utils/toast";
import { getLocalizedLoginSchema } from "@/utils/validators";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";

export function useLogin() {
  const { t } = useTranslation();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] =
    useLoginWithGoogleMutation();
  const dispatch = useAppDispatch();
  const [getProfile] = useLazyGetProfileQuery();
  const [sessionPhase, setSessionPhase] = useState<"idle" | "loading" | "success" | "error">("idle");
  const pendingLogin = useRef<AuthResponse | null>(null);
  const saved = useRef(false);
  const inFlight = useRef(false);
  const preparing = useRef(false);

  const prepareSession = async () => {
    const res = pendingLogin.current;
    if (!res || preparing.current) return;
    preparing.current = true;
    setSessionPhase("loading");
    try {
      if (!saved.current) {
        await saveTokens(res.access, res.refresh);
        saved.current = true;
        dispatch(baseApi.util.resetApiState());
      }
      const profile = await getProfile().unwrap();
      dispatch(setUser(profile));
      setSessionPhase("success");
    } catch {
      if (saved.current) {
        try {
          const token = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (!token) {
            setSessionPhase("idle");
            setError(t("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
            return;
          }
        } catch { /* Keep retry available when secure storage is temporarily unavailable. */ }
      }
      setSessionPhase("error");
    } finally {
      preparing.current = false;
    }
  };

  const finishSession = useCallback(() => {
    setSessionPhase("idle");
    router.replace(ROUTES.HOME);
  }, []);

  // Dùng chung cho đăng nhập thường và Google
  const finishLogin = async (res: AuthResponse) => {
    if (res.user.role !== "CUSTOMER") {
      const msg = t("Tài khoản này không dùng được trên ứng dụng khách hàng");
      setError(msg);
      showErrorToast(t("Đăng nhập thất bại"), msg);
      return;
    }
    pendingLogin.current = res;
    saved.current = false;
    await prepareSession();
  };

  const submit = async () => {
    if (inFlight.current || sessionPhase !== "idle") return;
    const result = getLocalizedLoginSchema(t).safeParse({ phone, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    inFlight.current = true;
    try {
      await finishLogin(await login({ phone, password }).unwrap());
    } catch (e) {
      const message = getApiErrorMessage(
        e,
        t("Đăng nhập thất bại, vui lòng thử lại"), t,
      );
      setError(message);
      showErrorToast(t("Đăng nhập thất bại"), message);
    } finally {
      inFlight.current = false;
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    if (inFlight.current || sessionPhase !== "idle") return;
    inFlight.current = true;
    setError("");
    try {
      await finishLogin(await loginWithGoogle({ id_token: idToken }).unwrap());
    } catch (e) {
      const message = getApiErrorMessage(
        e,
        t("Đăng nhập Google thất bại, vui lòng thử lại"), t,
      );
      setError(message);
      showErrorToast(t("Đăng nhập Google thất bại"), message);
    } finally {
      inFlight.current = false;
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
    sessionPhase,
    retrySession: prepareSession,
    finishSession,
    submit,
    submitGoogle: () => promptAsync(),
  };
}
