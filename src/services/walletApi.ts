import { baseApi } from "@/store/baseApi";

export type WalletTransactionType =
  | "PAYMENT"
  | "REFUND"
  | "WITHDRAW"
  | "ADJUSTMENT";

export type WalletTransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export type Wallet = {
  id: number;
  balance: string;
  updated_at: string;
};

export type WalletTransaction = {
  id: number;
  type: WalletTransactionType;
  type_display: string;
  amount: string;
  balance_after: string;
  status: WalletTransactionStatus;
  status_display: string;
  booking_code: string | null;
  note: string | null;
  created_at: string;
};

export type WalletTransactionListResponse = {
  results: WalletTransaction[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<Wallet, void>({
      query: () => ({
        url: "/api/customer/wallet/",
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<
      WalletTransactionListResponse,
      { page?: number; page_size?: number } | void
    >({
      query: (params) => ({
        url: "/api/customer/wallet/transactions/",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: unwrap,
      providesTags: ["WalletTransactions"],
    }),

    requestWithdraw: builder.mutation<WalletTransaction, { amount: number }>({
      query: (body) => ({
        url: "/api/customer/wallet/withdraw/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Wallet", "WalletTransactions"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useRequestWithdrawMutation,
} = walletApi;
