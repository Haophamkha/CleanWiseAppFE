import { STORAGE_KEYS } from "@/config/constants";
import { setUser } from "@/store/authSlice";
import { baseApi } from "@/store/baseApi";
import type {
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyResetOtpRequest,
} from "@/types/Request";
import type { AuthResponse, CustomerProfileResponse } from "@/types/Response";
import type { Gender } from "@/types/User";
import { storage } from "@/utils/storage";

const saveTokens = async (access: string, refresh: string) => {
  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
};

// Bóc đúng lớp lồng nhau nếu BE bọc { success, data: { data: {...} } };
// nếu BE trả thẳng object thì fallback về response gốc, không ảnh hưởng.
const unwrapResponse = (response: any) => {
  return response?.data?.data ?? response?.data ?? response;
};

export type UpdateCustomerProfileRequest = Partial<{
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: Gender;
  birth_date: string; // yyyy-MM-dd
  avatar: { uri: string; name: string; type: string };
}>;

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
        } catch {}
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/api/auth/register/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
        } catch {}
      },
    }),
    loginWithGoogle: builder.mutation<AuthResponse, GoogleLoginRequest>({
      query: (body) => ({
        url: "/api/auth/login-google/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await saveTokens(data.access, data.refresh);
        } catch {}
      },
    }),
    getProfile: builder.query<CustomerProfileResponse, void>({
      query: () => ({
        url: "/api/auth/customer/profile/",
        method: "GET",
      }),
      transformResponse: unwrapResponse,
      providesTags: ["Profile"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {}
      },
    }),
    updateProfile: builder.mutation<
      CustomerProfileResponse,
      UpdateCustomerProfileRequest
    >({
      query: (body) => {
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (key === "avatar") {
            formData.append("avatar", value as any);
          } else {
            formData.append(key, String(value));
          }
        });
        return {
          url: "/api/auth/customer/profile/",
          method: "PATCH",
          data: formData,
        };
      },
      transformResponse: unwrapResponse,
      invalidatesTags: ["Profile"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {}
      },
    }),
    forgotPassword: builder.mutation<
      { message?: string },
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/api/auth/forgot-password/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
    }),
    verifyResetOtp: builder.mutation<
      { message?: string },
      VerifyResetOtpRequest
    >({
      query: (body) => ({
        url: "/api/auth/verify-reset-otp/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrapResponse,
    }),
    resetPassword: builder.mutation<{ message?: string }, ResetPasswordRequest>(
      {
        query: (body) => ({
          url: "/api/auth/reset-password/",
          method: "POST",
          data: body,
        }),
        transformResponse: unwrapResponse,
      },
    ),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLoginWithGoogleMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi;
