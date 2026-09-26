import { baseApi } from "@/store/baseApi";

import type {
  ComplaintDetail,
  ComplaintIssueType,
  ComplaintIssueTypeStage,
  ComplaintListItem,
  ComplaintListResponse,
  ComplaintStage,
  ComplaintStatus,
  CreateComplaintPayload,
} from "@/types/Complaint";

const unwrap = <T>(response: unknown): T => {
  if (response && typeof response === "object" && "data" in response) {
    const level1 = (response as { data?: unknown }).data;

    if (
      level1 &&
      typeof level1 === "object" &&
      !Array.isArray(level1) &&
      "data" in level1
    ) {
      return (level1 as { data?: T }).data as T;
    }

    return level1 as T;
  }

  return response as T;
};

const normalizeComplaintList = (
  data: ComplaintListResponse | ComplaintListItem[] | null | undefined,
): ComplaintListResponse => {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      total_pages: 1,
      has_next: false,
      has_previous: false,
      page_size: data.length,
    };
  }

  if (data && Array.isArray(data.results)) {
    return data;
  }

  return {
    results: [],
    count: 0,
    page: 1,
    total_pages: 1,
    has_next: false,
    has_previous: false,
    page_size: 0,
  };
};

export const complaintApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplaintIssueTypes: builder.query<
      ComplaintIssueType[],
      {
        stage?: ComplaintIssueTypeStage;
      } | void
    >({
      query: (params) => ({
        url: "/api/customer/complaint-issue-types/",
        method: "GET",
        params: params ?? {},
      }),

      transformResponse: (response: unknown) =>
        unwrap<ComplaintIssueType[]>(response),

      providesTags: ["Complaints"],
    }),

    createComplaint: builder.mutation<ComplaintDetail, CreateComplaintPayload>({
      query: ({ files, content, ...body }) => {
        const formData = new FormData();

        formData.append("booking", String(body.booking));
        formData.append("schedule", String(body.schedule));
        formData.append("issue_type", String(body.issue_type));

        if (content) {
          formData.append("content", content);
        }

        (files ?? []).forEach((file) => {
          formData.append("attachments", {
            uri: file.uri,
            name: file.name ?? `photo-${Date.now()}.jpg`,
            type: file.type ?? "image/jpeg",
          } as any);
        });

        return {
          url: "/api/customer/complaints/",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },

      transformResponse: (response: unknown) =>
        unwrap<ComplaintDetail>(response),

      invalidatesTags: ["Complaints"],
    }),

    getComplaints: builder.query<
      ComplaintListResponse,
      {
        status?: ComplaintStatus;
        stage?: ComplaintStage;
        issue_type?: number;
        schedule?: number;
        page?: number;
        page_size?: number;
      } | void
    >({
      query: (params) => ({
        url: "/api/customer/complaints/",
        method: "GET",
        params: params ?? {},
      }),

      transformResponse: (response: unknown) => {
        const data = unwrap<ComplaintListResponse | ComplaintListItem[]>(
          response,
        );

        return normalizeComplaintList(data);
      },

      providesTags: (result) => {
        if (!result?.results) {
          return ["Complaints"];
        }

        return [
          "Complaints",
          ...result.results.map((complaint) => ({
            type: "Complaints" as const,
            id: complaint.id,
          })),
        ];
      },
    }),

    getComplaintDetail: builder.query<ComplaintDetail, number>({
      query: (id) => ({
        url: `/api/customer/complaints/${id}/`,
        method: "GET",
      }),

      transformResponse: (response: unknown) =>
        unwrap<ComplaintDetail>(response),

      providesTags: (result, error, id) => [
        {
          type: "Complaints",
          id,
        },
      ],
    }),

    cancelComplaint: builder.mutation<ComplaintDetail, number>({
      query: (id) => ({
        url: `/api/customer/complaints/${id}/cancel/`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        unwrap<ComplaintDetail>(response),

      invalidatesTags: (result, error, id) => [
        {
          type: "Complaints",
          id,
        },
        "Complaints",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetComplaintIssueTypesQuery,
  useCreateComplaintMutation,
  useGetComplaintsQuery,
  useGetComplaintDetailQuery,
  useCancelComplaintMutation,
} = complaintApi;
