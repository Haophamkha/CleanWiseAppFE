import type {
  AssignmentReviewState,
  Review,
} from "@/features/review/types/Review";
import type { ReviewQuery } from "@/features/review/types/ReviewFilters";
import { baseApi } from "@/store/baseApi";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignmentReview: builder.query<AssignmentReviewState, number>({
      query: (id) => ({
        url: `/api/customer/reviews/assignments/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Reviews"],
    }),
    createReview: builder.mutation<Review, FormData>({
      query: (data) => ({
        url: "/api/customer/reviews/",
        method: "POST",
        data,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_result, error) =>
        error
          ? []
          : ["Reviews", "Bookings", "WorkerProfile", "FavoriteWorkers"],
    }),
    getMyReviews: builder.query<Review[], ReviewQuery>({
      query: (params) => ({
        url: "/api/customer/reviews/",
        method: "GET",
        params,
      }),
      transformResponse: unwrap,
      providesTags: ["Reviews"],
    }),
    updateReview: builder.mutation<Review, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/api/customer/reviews/${id}/`,
        method: "PATCH",
        data,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_result, error) =>
        error ? [] : ["Reviews", "Bookings", "WorkerProfile", "FavoriteWorkers"],
    }),
  }),
});

export const {
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
  useGetAssignmentReviewQuery,
  useCreateReviewMutation,
} = reviewApi;
