import {
  AppNotification,
  NotificationListData,
  NotificationListParams,
} from "@/features/notification/types/Notification";
import { baseApi } from "@/store/baseApi";

export type NotificationPreference = { push_enabled: boolean };

// BE bọc mọi response qua 1 middleware toàn cục, khiến field `data` gốc
// của view bị lồng thêm 1 tầng `data` nữa.
// Cần unwrap 2 tầng, không phải 1 tầng.
const unwrapResponse = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationListData,
      NotificationListParams | void
    >({
      query: (params) => ({
        url: "/api/notifications/",
        method: "GET",
        params: params ?? undefined,
      }),

      transformResponse: unwrapResponse,

      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((n: AppNotification) => ({
                type: "Notifications" as const,
                id: n.id,
              })),
              { type: "Notifications" as const, id: "LIST" },
            ]
          : [{ type: "Notifications" as const, id: "LIST" }],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => ({
        url: "/api/notifications/unread-count/",
        method: "GET",
      }),

      transformResponse: (response: any) =>
        unwrapResponse(response)?.unread_count,

      providesTags: [{ type: "Notifications", id: "COUNT" }],
    }),

    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/notifications/${id}/mark-read/`,
        method: "POST",
      }),

      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "COUNT" },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/api/notifications/mark-all-read/",
        method: "POST",
      }),

      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "COUNT" },
      ],
    }),

    // Xoá toàn bộ thông báo của người dùng
    clearAllNotifications: builder.mutation<{ deleted: number }, void>({
      query: () => ({
        url: "/api/notifications/clear-all/",
        method: "DELETE",
      }),

      transformResponse: unwrapResponse,

      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "COUNT" },
      ],
    }),

    // Cài đặt thông báo (bật/tắt push)
    getNotificationPreferences: builder.query<NotificationPreference, void>({
      query: () => ({
        url: "/api/notifications/preferences/",
        method: "GET",
      }),

      transformResponse: unwrapResponse,

      providesTags: [{ type: "Notifications", id: "PREFS" }],
    }),

    updateNotificationPreferences: builder.mutation<
      NotificationPreference,
      Partial<NotificationPreference>
    >({
      query: (body) => ({
        url: "/api/notifications/preferences/",
        method: "PATCH",
        data: body,
      }),

      transformResponse: unwrapResponse,

      // Cập nhật công tắc ngay, lỗi thì hoàn lại
      onQueryStarted: async (patch, { dispatch, queryFulfilled }) => {
        const undo = dispatch(
          notificationApi.util.updateQueryData(
            "getNotificationPreferences",
            undefined,
            (draft) => {
              Object.assign(draft, patch);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          undo.undo();
        }
      },
    }),

    registerPushToken: builder.mutation<
      void,
      { token: string; platform: string }
    >({
      query: (body) => ({
        url: "/api/notifications/push-token/",
        method: "POST",
        data: body,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useRegisterPushTokenMutation,
} = notificationApi;
