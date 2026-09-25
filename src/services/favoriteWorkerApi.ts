import { baseApi } from "@/store/baseApi";
import type {
  FavoriteWorker,
  FavoriteWorkerListResponse,
} from "@/types/FavoriteWorker";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const favoriteWorkerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkerProfile: builder.query<FavoriteWorker, number>({
      query: (workerId) => ({
        url: `/api/customer/workers/${workerId}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: (_result, _error, workerId) => [
        { type: "WorkerProfile", id: workerId },
      ],
    }),

    getFavoriteWorkers: builder.query<
      FavoriteWorkerListResponse,
      { page?: number; page_size?: number } | void
    >({
      query: (params) => ({
        url: "/api/customer/favorite-workers/",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: unwrap,
      providesTags: (result) => [
        "FavoriteWorkers",
        ...(result?.results.map((worker) => ({
          type: "WorkerProfile" as const,
          id: worker.worker_id,
        })) ?? []),
      ],
    }),

    addFavoriteWorker: builder.mutation<FavoriteWorker, number>({
      query: (workerId) => ({
        url: `/api/customer/favorite-workers/${workerId}/`,
        method: "PUT",
        timeout: 30000,
      }),
      transformResponse: unwrap,
      invalidatesTags: (_result, error, workerId) =>
        error
          ? []
          : [
              "FavoriteWorkers",
              "Bookings",
              { type: "WorkerProfile", id: workerId },
            ],
    }),

    removeFavoriteWorker: builder.mutation<void, number>({
      query: (workerId) => ({
        url: `/api/customer/favorite-workers/${workerId}/`,
        method: "DELETE",
        timeout: 30000,
      }),
      invalidatesTags: (_result, error, workerId) =>
        error
          ? []
          : [
              "FavoriteWorkers",
              "Bookings",
              { type: "WorkerProfile", id: workerId },
            ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWorkerProfileQuery,
  useGetFavoriteWorkersQuery,
  useAddFavoriteWorkerMutation,
  useRemoveFavoriteWorkerMutation,
} = favoriteWorkerApi;
