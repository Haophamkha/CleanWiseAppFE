import { STORAGE_KEYS } from "@/config/constants";
import { ENV } from "@/config/env";
import { storage } from "@/utils/storage";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

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
  "/api/services/",
];

axiosInstance.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublic) {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && token !== "undefined" && token !== "null") {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // FormData
  if (config.data instanceof FormData) {
    delete config.headers?.["Content-Type"];
  }

  if (__DEV__) {
    console.log("[REQUEST]", config.method?.toUpperCase(), config.url, {
      hasAuthHeader: !!config.headers?.Authorization,
      isFormData: config.data instanceof FormData,
      body: config.data,
    });
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("[RESPONSE OK]", response.config.url, response.data);
    }

    return response;
  },
  (error) => {
    if (__DEV__) {
      console.log("[RESPONSE ERROR]", error.config?.url, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
    }

    return Promise.reject(error);
  },
);

type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: any;
  params?: any;
  timeout?: number; // ĐỔI: cho phép override timeout riêng cho từng request
};

const axiosBaseQuery = (): BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  unknown
> => {
  return async ({ url, method, data, params, timeout }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        timeout,
      });

      return {
        data: result.data,
      };
    } catch (axiosError) {
      const err = axiosError as AxiosError;

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),

  // Các loại cache tag của RTK Query
  tagTypes: [
    "ChatConversations",
    "Profile",
    "Addresses",
    "PublicVouchers",
    "MyVouchers",
    "Bookings",
    "Services",
    "Wallet",
    "WalletTransactions",
  ],

  endpoints: () => ({}),
});
