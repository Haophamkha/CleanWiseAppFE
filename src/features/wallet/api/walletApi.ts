import { baseApi } from "@/store/baseApi";

export type WalletTransactionType =
  | "PAYMENT"
  | "REFUND"
  | "WITHDRAW"
  | "TOPUP"
  | "ADJUSTMENT"
  | "EARNING";

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
  direction: "CREDIT" | "DEBIT";
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

export type WithdrawStatus = "PROCESSING" | "SUCCESS" | "FAILED";

export type WithdrawRecord = {
  id: number;
  amount: string;
  status: WithdrawStatus;
  status_display: string;
  bank_name: string;
  account_holder_name: string;
  account_number_masked: string;
  failure_reason: string;
  wallet_transaction_id: number | null;
  created_at: string;
  completed_at: string | null;
};

export type WalletTopup = {
  id: number;
  amount: string;
  status: string; // PENDING | SUCCESS | EXPIRED | ...
  status_display: string;
  checkout_url: string | null;
  qr_code: string | null;
  payment_link_id: string | null;
  link_expires_at: string | null;
  paid_at: string | null;
  created_at: string;
};

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

const MONEY_TIMEOUT_MS = 30000; // gọi payOS có thể chậm hơn 10s mặc định

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<Wallet, void>({
      query: () => ({ url: "/api/customer/wallet/", method: "GET" }),
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

    requestWithdraw: builder.mutation<
      WithdrawRecord,
      {
        amount: number;
        paymentMethodId?: number | null;
        idempotencyKey: string;
      }
    >({
      query: ({ idempotencyKey, paymentMethodId, amount }) => ({
        url: "/api/customer/wallet/withdraw/",
        method: "POST",
        data: {
          amount,
          ...(paymentMethodId ? { payment_method_id: paymentMethodId } : {}),
        },
        headers: { "Idempotency-Key": idempotencyKey },
        timeout: MONEY_TIMEOUT_MS,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Wallet", "WalletTransactions"],
    }),

    getWithdraw: builder.query<WithdrawRecord, number>({
      query: (id) => ({
        url: `/api/customer/wallet/withdraw/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
    }),

    createTopup: builder.mutation<
      WalletTopup,
      { amount: number; idempotencyKey: string }
    >({
      query: ({ idempotencyKey, amount }) => ({
        url: "/api/customer/wallet/topup/",
        method: "POST",
        data: { amount },
        headers: { "Idempotency-Key": idempotencyKey },
        timeout: MONEY_TIMEOUT_MS,
      }),
      transformResponse: unwrap,
    }),

    getTopup: builder.query<WalletTopup, number>({
      query: (id) => ({
        url: `/api/customer/wallet/topup/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
    }),

    // Chỉ dùng khi dev (BE mock). Production route này không tồn tại.
    mockConfirmTopup: builder.mutation<WalletTopup, number>({
      query: (id) => ({
        url: `/api/customer/wallet/topup/${id}/mock-confirm/`,
        method: "POST",
      }),
      transformResponse: unwrap,
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useRequestWithdrawMutation,
  useGetWithdrawQuery,
  useCreateTopupMutation,
  useGetTopupQuery,
  useMockConfirmTopupMutation,
} = walletApi;
