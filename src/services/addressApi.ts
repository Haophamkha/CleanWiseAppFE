import { baseApi } from "@/store/baseApi";
import type { Address, AddressPayload } from "@/types/Address";

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET danh sách địa chỉ
    getAddresses: builder.query<Address[], void>({
      query: () => ({
        url: "/api/customer/addresses/",
        method: "GET",
      }),
      transformResponse: (response: any) => unwrap(response) ?? [],
      providesTags: ["Addresses"],
    }),

    // GET chi tiết địa chỉ
    getAddressDetail: builder.query<Address, number>({
      query: (id) => ({
        url: `/api/customer/addresses/${id}/`,
        method: "GET",
      }),
      transformResponse: unwrap,
      providesTags: ["Addresses"],
    }),

    // POST tạo địa chỉ
    createAddress: builder.mutation<Address, AddressPayload>({
      query: (payload) => ({
        url: "/api/customer/addresses/",
        method: "POST",
        data: payload,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),

    // PATCH cập nhật địa chỉ
    updateAddress: builder.mutation<
      Address,
      {
        id: number;
        payload: Partial<AddressPayload>;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/api/customer/addresses/${id}/`,
        method: "PATCH",
        data: payload,
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),

    // DELETE địa chỉ
    deleteAddress: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/customer/addresses/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),

    // PATCH đặt địa chỉ mặc định
    setDefaultAddress: builder.mutation<Address, number>({
      query: (id) => ({
        url: `/api/customer/addresses/${id}/default/`,
        method: "PATCH",
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Addresses"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAddressesQuery,
  useGetAddressDetailQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
