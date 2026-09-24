import { baseApi } from "@/store/baseApi";
import type {
  BookingDetail,
  BookingListResponse,
  BookingStatus,
  CreateBookingRequest,
} from "@/types/Booking";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================================
    // Tạo booking
    // ============================================================
    createBooking: builder.mutation<BookingDetail, CreateBookingRequest>({
      query: (body) => ({
        url: "/api/customer/bookings/",
        method: "POST",
        data: body,
        timeout: 30000,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Bookings"],
    }),

    // ============================================================
    // Danh sách booking
    // ============================================================
    getBookings: builder.query<
      BookingListResponse,
      {
        status?: BookingStatus;
        page?: number;
        page_size?: number;
      } | void
    >({
      query: (params) => ({
        url: "/api/customer/bookings/",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: unwrap,
      providesTags: ["Bookings"],
    }),

    // ============================================================
    // Chi tiết booking
    // ============================================================
    getBookingDetail: builder.query<BookingDetail, number>({
      query: (id) => ({
        url: `/api/customer/bookings/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),

    // ============================================================
    // Tạo payment link / QR
    // ============================================================
    createPaymentLink: builder.mutation<
      {
        checkout_url: string;
        qr_code: string;
        payment_link_id: string;
      },
      number
    >({
      query: (bookingId) => ({
        url: `/api/customer/bookings/${bookingId}/payment-link/`,
        method: "POST",
      }),
      transformResponse: unwrap,
    }),

    // ============================================================
    // Hủy booking
    // ============================================================
    cancelBooking: builder.mutation<
      {
        id: number;
        status: BookingStatus;
        payment_status: string;
      },
      {
        id: number;
        reason: string;
      }
    >({
      query: ({ id, reason }) => ({
        url: `/api/customer/bookings/${id}/cancel/`,
        method: "POST",
        data: { reason },
      }),
      transformResponse: unwrap,

      // Đơn đã thanh toán online sẽ được BE tự hoàn tiền vào ví
      // khi hủy, nên invalidate luôn Wallet/WalletTransactions
      // để số dư cập nhật theo.
      invalidatesTags: (result, error, { id }) => [
        { type: "Bookings", id },
        "Bookings",
        "Wallet",
        "WalletTransactions",
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetBookingDetailQuery,
  useCreatePaymentLinkMutation,
  useCancelBookingMutation,
} = bookingApi;
