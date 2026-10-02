import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { clearAuth } from "@/store/authSlice";
import { storage } from "@/utils/storage";
import { showErrorToast } from "@/utils/toast";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { router } from "expo-router";

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/login-google/",
  "/api/auth/register/",
  "/api/auth/forgot-password/",
  "/api/auth/verify-reset-otp/",
  "/api/auth/reset-password/",
  "/api/auth/token/refresh/",
  "/api/auth/logout/",
  "/api/services/",
];

const REFRESH_URL = "/api/auth/token/refresh/";
const LOGOUT_URL = "/api/auth/logout/";

const isValidToken = (t: string | null | undefined): t is string =>
  !!t && t !== "undefined" && t !== "null";

/* =========================================================
 * REDUX DISPATCH
 * ======================================================= */

let authDispatch: Dispatch<UnknownAction> | null = null;

export const registerAuthDispatch = (dispatch: Dispatch<UnknownAction>) => {
  authDispatch = dispatch;
};

/* =========================================================
 * REQUEST INTERCEPTOR
 * ======================================================= */

axiosInstance.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublic) {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (isValidToken(token)) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers?.["Content-Type"];
  }

  if (__DEV__) {
    const loggedBody =
      config.data &&
      typeof config.data === "object" &&
      Object.prototype.hasOwnProperty.call(config.data, "account_number")
        ? { ...config.data, account_number: "[REDACTED]" }
        : config.data;

    console.log("[REQUEST]", config.method?.toUpperCase(), config.url, {
      hasAuthHeader: !!config.headers?.Authorization,
      isFormData: config.data instanceof FormData,
      body: loggedBody,
    });
  }

  return config;
});

/* =========================================================
 * REFRESH TOKEN (1 promise dùng chung cho HTTP và WebSocket)
 * ======================================================= */

const doRefresh = async (): Promise<string> => {
  const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!isValidToken(refreshToken)) throw new Error("NO_REFRESH_TOKEN");

  // axios thường (không qua axiosInstance) để tránh interceptor chạy vòng lặp
  const response = await axios.post(
    `${ENV.API_URL}${REFRESH_URL}`,
    { refresh: refreshToken },
    { timeout: 10000 },
  );

  const data = response.data?.data ?? response.data;
  if (typeof data?.access !== "string") throw new Error("BAD_REFRESH_RESPONSE");

  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  // BE bật ROTATE_REFRESH_TOKENS: BẮT BUỘC lưu refresh mới
  if (typeof data.refresh === "string") {
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  }
  return data.access;
};

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> =>
  (refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  }));

// Chỉ logout khi BE TỪ CHỐI refresh token. Mất mạng / timeout / 5xx / 429 thì giữ phiên.
const shouldLogout = async (e: unknown): Promise<boolean> => {
  if (e instanceof Error && e.message === "NO_REFRESH_TOKEN") {
    // Khách chưa đăng nhập (không có access token) thì không đá ra login
    return isValidToken(await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  }
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    return status === 400 || status === 401 || status === 403;
  }
  return true; // BAD_REFRESH_RESPONSE
};

/* =========================================================
 * LOGOUT (dùng chung cho tự động và nút Đăng xuất)
 * ======================================================= */

let isLoggingOut = false;

export const performLogout = async (
  redirectTo: string = "/(auth)/login",
): Promise<void> => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  try {
    const refresh = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const pushToken = await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);

    // Báo BE thu hồi refresh token + xóa push token; lỗi mạng thì bỏ qua
    if (isValidToken(refresh)) {
      axios
        .post(
          `${ENV.API_URL}${LOGOUT_URL}`,
          {
            refresh,
            ...(isValidToken(pushToken) && { push_token: pushToken }),
          },
          { timeout: 5000 },
        )
        .catch(() => {});
    }

    await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.deleteItem(STORAGE_KEYS.PUSH_TOKEN);
  } finally {
    authDispatch?.(clearAuth());
    authDispatch?.(baseApi.util.resetApiState());
    router.replace(redirectTo as any);
    isLoggingOut = false;
  }
};

/* =========================================================
 * RATE LIMIT (429)
 * ======================================================= */

let lastRateLimitToastAt = 0;

const showRateLimitToast = (retryAfter?: string) => {
  const now = Date.now();
  if (now - lastRateLimitToastAt < 3000) return; // tránh spam toast
  lastRateLimitToastAt = now;
  showErrorToast(
    "Thao tác quá nhanh",
    retryAfter
      ? `Vui lòng thử lại sau ${retryAfter} giây.`
      : "Vui lòng thử lại sau ít giây.",
  );
};

/* =========================================================
 * RESPONSE INTERCEPTOR
 * ======================================================= */

const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("[RESPONSE OK]", response.config.url, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (__DEV__) {
      console.log("[RESPONSE ERROR]", originalRequest?.url, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    if (!originalRequest) return Promise.reject(error);

    // Bị giới hạn tần suất: báo người dùng, không refresh, không retry
    if (error.response?.status === 429) {
      showRateLimitToast(
        error.response.headers?.["retry-after"] as string | undefined,
      );
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) return Promise.reject(error);

    // Endpoint public: 401 là lỗi nghiệp vụ, không refresh, không logout
    const isPublic = PUBLIC_ENDPOINTS.some((p) =>
      originalRequest.url?.includes(p),
    );
    if (isPublic || originalRequest._retry) return Promise.reject(error);

    originalRequest._retry = true;

    // Request dùng token cũ, nhưng storage đã có token mới (do request khác
    // vừa refresh xong): chỉ cần gửi lại bằng token mới, không refresh thêm
    const sentAuth = (
      originalRequest.headers as Record<string, string> | undefined
    )?.Authorization;
    const current = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (isValidToken(current) && sentAuth !== `Bearer ${current}`) {
      setAuthHeader(originalRequest, current);
      return axiosInstance(originalRequest);
    }

    try {
      const token = await refreshAccessToken();
      setAuthHeader(originalRequest, token);
      // Không await: lỗi của request retry không được rơi vào catch bên dưới
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (await shouldLogout(refreshError)) await performLogout();
      return Promise.reject(error);
    }
  },
);

/* =========================================================
 * IDEMPOTENCY AUTO-RETRY
 * ======================================================= */

const IDEMPOTENCY_RETRY_DELAY_MS = 1500;
const IDEMPOTENCY_MAX_RETRIES = 3;

const isIdempotencyProcessing = (error: AxiosError): boolean => {
  const data = error.response?.data as { error_code?: string } | undefined;
  return (
    error.response?.status === 409 &&
    data?.error_code === "IDEMPOTENCY_PROCESSING"
  );
};

const hasIdempotencyKey = (config: AxiosRequestConfig): boolean => {
  const headers = config.headers as Record<string, string> | undefined;
  return !!headers?.["Idempotency-Key"];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: any;
  params?: any;
  timeout?: number;
  headers?: Record<string, string>;
};

const axiosBaseQuery = (): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  unknown
> => {
  return async ({ url, method, data, params, timeout, headers }) => {
    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      data,
      params,
      timeout,
      ...(headers !== undefined && { headers }),
    };

    for (let attempt = 0; attempt <= IDEMPOTENCY_MAX_RETRIES; attempt++) {
      try {
        const result = await axiosInstance(requestConfig);
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError as AxiosError;

        const shouldRetry =
          isIdempotencyProcessing(err) &&
          hasIdempotencyKey(requestConfig) &&
          attempt < IDEMPOTENCY_MAX_RETRIES;

        if (shouldRetry) {
          if (__DEV__) {
            console.log(
              "[IDEMPOTENCY RETRY]",
              url,
              `attempt ${attempt + 1}/${IDEMPOTENCY_MAX_RETRIES}`,
            );
          }
          await sleep(IDEMPOTENCY_RETRY_DELAY_MS);
          continue;
        }

        const retryAfterRaw = err.response?.headers?.["retry-after"];

        return {
          error: {
            status: err.response?.status,
            data: err.response?.data || err.message,
            retryAfter: Number(retryAfterRaw) || undefined,
          },
        };
      }
    }

    return { error: { data: "unreachable" } };
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),

  tagTypes: [
    "Reviews",
    "ChatConversations",
    "Profile",
    "Addresses",
    "PublicVouchers",
    "MyVouchers",
    "Bookings",
    "Services",
    "Wallet",
    "WalletTransactions",
    "FavoriteWorkers",
    "WorkerProfile",
    "PaymentMethods",
    "BankCatalog",
    "Complaints",
    "Notifications",
  ],

  endpoints: () => ({}),
});
