import type {
  BookingDetail,
  BookingListResponse,
  BookingStatus,
  CancelScheduleResult,
  CreateBookingRequest,
} from "@/features/booking/types/Booking";
import { baseApi } from "@/store/baseApi";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<
      BookingDetail,
      CreateBookingRequest & { idempotencyKey: string }
    >({
      query: ({ idempotencyKey, ...body }) => ({
        url: "/api/customer/bookings/",
        method: "POST",
        data: body,
        timeout: 30000,
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrap,
      invalidatesTags: [
        "Bookings",
        "MyVouchers",
        "Wallet",
        "WalletTransactions",
      ],
    }),

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

    getBookingDetail: builder.query<BookingDetail, number>({
      query: (id) => ({
        url: `/api/customer/bookings/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),

    createPaymentLink: builder.mutation<
      {
        checkout_url: string;
        qr_code: string;
        payment_link_id: string;
        expires_at: string;
        bank_bin?: string;
        account_number?: string;
        account_name?: string;
        transfer_content?: string;
        amount?: number;
      },
      {
        bookingId: number;
        idempotencyKey: string;
      }
    >({
      query: ({ bookingId, idempotencyKey }) => ({
        url: `/api/customer/bookings/${bookingId}/payment-link/`,
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }),
      transformResponse: unwrap,
    }),

    cancelBooking: builder.mutation<
      {
        id: number;
        status: BookingStatus;
        payment_status: string;
        refunded_amount: string;
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
        headers: {
          "Idempotency-Key": `cancel-booking-${id}`,
        },
      }),
      transformResponse: unwrap,
      invalidatesTags: (result, error, { id }) => [
        { type: "Bookings", id },
        "Bookings",
        "Wallet",
        "WalletTransactions",
        "MyVouchers",
      ],
    }),
    cancelSchedule: builder.mutation<
      CancelScheduleResult,
      { scheduleId: number; bookingId: number; reason: string }
    >({
      query: ({ scheduleId, reason }) => ({
        url: `/api/customer/bookings/schedules/${scheduleId}/cancel/`,
        method: "POST",
        data: { reason },
        headers: { "Idempotency-Key": `cancel-schedule-${scheduleId}` },
      }),
      transformResponse: unwrap,
      invalidatesTags: (result, error, { bookingId }) => [
        { type: "Bookings", id: bookingId },
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
  useCancelScheduleMutation,
} = bookingApi;
