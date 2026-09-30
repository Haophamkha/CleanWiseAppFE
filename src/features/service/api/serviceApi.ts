import type {
  ServiceDetail,
  ServiceListItem,
} from "@/features/service/types/Service";
import { baseApi } from "@/store/baseApi";

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServiceListItem[], void>({
      query: () => ({
        url: "/api/services/",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data?.data ?? [],
    }),

    getServiceDetail: builder.query<ServiceDetail, number>({
      query: (id) => ({
        url: `/api/services/${id}/`,
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data?.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetServicesQuery, useGetServiceDetailQuery } = serviceApi;
