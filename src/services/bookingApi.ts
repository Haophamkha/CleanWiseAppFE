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
    createBooking: builder.mutation<BookingDetail, CreateBookingRequest>({
      query: (body) => ({
        url: "/api/customer/bookings/",
        method: "POST",
        data: body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Bookings"],
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
  }),
  overrideExisting: false,
});

export const {
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetBookingDetailQuery,
} = bookingApi;
