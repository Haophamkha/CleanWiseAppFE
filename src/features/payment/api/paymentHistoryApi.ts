import { baseApi } from "@/store/baseApi";

export type PaymentHistorySource = "all" | "wallet" | "online";

export type PaymentHistoryStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentHistoryStatusFilter =
  | "all"
  | "paid"
  | "pending"
  | "cancelled"
  | "refunded";

export type PaymentHistoryItem = {
  id: string;
  kind: "PAYMENT" | "REFUND";
  channel: "ONLINE" | "WALLET";
  direction: "CREDIT" | "DEBIT";
  title: string;
  method_display: string;
  amount: string;
  status: PaymentHistoryStatus;
  status_display: string;
  booking_id: number | null;
  booking_code: string;
  note: string;
  created_at: string;
};

export type PaymentHistorySummary = {
  paid_total: string;
  refunded_total: string;
};

export type PaymentHistoryResponse = {
  results: PaymentHistoryItem[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  summary: PaymentHistorySummary;
};

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const paymentHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentHistory: builder.query<
      PaymentHistoryResponse,
      {
        source?: PaymentHistorySource;
        status?: PaymentHistoryStatusFilter;
        page?: number;
        page_size?: number;
      }
    >({
      query: (params) => ({
        url: "/api/customer/payments/history/",
        method: "GET",
        params,
      }),
      transformResponse: unwrap,
      providesTags: ["WalletTransactions", "Bookings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPaymentHistoryQuery } = paymentHistoryApi;
