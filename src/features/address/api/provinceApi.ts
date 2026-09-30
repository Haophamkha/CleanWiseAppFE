import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

export type Province = {
  code: number;
  name: string;
  wards?: Ward[];
};

export type Ward = {
  code: number;
  name: string;
};

type ProvinceQuery = {
  url: string;
  params?: Record<string, unknown>;
};

const provinceAxios = axios.create({
  baseURL: "https://provinces.open-api.vn/api/v2",
  timeout: 10000,
});

const provinceBaseQuery: BaseQueryFn<
  ProvinceQuery,
  unknown,
  {
    status?: number;
    data?: unknown;
    message?: string;
  }
> = async ({ url, params }) => {
  try {
    const result = await provinceAxios.get(url, {
      params,
    });

    return {
      data: result.data,
    };
  } catch (error: any) {
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      },
    };
  }
};

export const provinceApi = createApi({
  reducerPath: "provinceApi",
  baseQuery: provinceBaseQuery,
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => ({
        url: "/p/",
      }),
    }),

    getWardsByProvince: builder.query<Ward[], number>({
      query: (provinceCode) => ({
        url: `/p/${provinceCode}`,
        params: {
          depth: 2,
        },
      }),

      transformResponse: (response: Province) => {
        return response?.wards ?? [];
      },
    }),
  }),
});

export const { useGetProvincesQuery, useGetWardsByProvinceQuery } = provinceApi;
