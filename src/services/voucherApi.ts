import { baseApi } from "@/store/baseApi";
import type { UserVoucher, Voucher } from "@/types/Voucher";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const voucherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicVouchers: builder.query<Voucher[], void>({
      query: () => ({
        url: "/api/customer/vouchers/",
        method: "GET",
      }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["PublicVouchers"],
    }),
    getMyVouchers: builder.query<UserVoucher[], void>({
      query: () => ({
        url: "/api/customer/vouchers/my-vouchers/",
        method: "GET",
      }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["MyVouchers"],
    }),
    claimVoucherByCode: builder.mutation<UserVoucher, string>({
      query: (code) => ({
        url: "/api/customer/vouchers/claim-by-code/",
        method: "POST",
        data: { code },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["PublicVouchers", "MyVouchers"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublicVouchersQuery,
  useGetMyVouchersQuery,
  useClaimVoucherByCodeMutation,
} = voucherApi;
