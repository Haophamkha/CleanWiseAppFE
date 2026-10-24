import { useTranslation } from "react-i18next";

import {
  notificationApi,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notification/api/notificationApi";
import { NotificationFilter } from "@/features/notification/components/NotificationFilterTabs";
import { AppNotification } from "@/features/notification/types/Notification";
import {
  getNotificationRoute,
  getLocalizedNotificationFilterOptions,
} from "@/features/notification/utils/notificationMeta";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

const PAGE_SIZE = 20;
const PREFETCH_GAP_MS = 400;

const dedupe = (list: AppNotification[]) => {
  const seen = new Set<number>();

  return list.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
};

export function useNotifications() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AppNotification[]>([]);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...(filter !== "ALL" ? { type: filter } : {}),
    }),
    [filter, page, t],
  );

  // Chỉ lấy dữ liệu đúng với tham số hiện tại.
  const { currentData, isFetching, isError, refetch } =
    useGetNotificationsQuery(queryParams, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    });

  const [markRead] = useMarkNotificationReadMutation();

  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const prefetch = notificationApi.usePrefetch("getNotifications");

  // Nối dữ liệu các trang tiếp theo và loại bỏ thông báo trùng lặp.
  useEffect(() => {
    if (page > 1 && currentData) {
      setItems((prev) => dedupe([...prev, ...currentData.results]));
    }
  }, [currentData, page]);

  // Prefetch các tab khác sau khi trang đầu của tab hiện tại tải xong.
  useEffect(() => {
    const firstPageLoaded = page === 1 && !!currentData;

    if (!firstPageLoaded) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    getLocalizedNotificationFilterOptions().filter(
      (option) => option.value !== filter,
    ).forEach((option, index) => {
      timers.push(
        setTimeout(
          () =>
            prefetch(
              {
                page: 1,
                page_size: PAGE_SIZE,
                ...(option.value !== "ALL"
                  ? { type: option.value as any }
                  : {}),
              },
              { ifOlderThan: 60 },
            ),
          (index + 1) * PREFETCH_GAP_MS,
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [page, currentData, filter, prefetch, t]);

  const list = page === 1 ? (currentData?.results ?? []) : items;

  const unreadCount = currentData?.unread_count ?? 0;

  // Đang tải trang đầu và chưa có dữ liệu để hiển thị.
  const isLoading = page === 1 && !currentData && isFetching;

  const changeFilter = (value: NotificationFilter) => {
    if (value === filter) return;

    setFilter(value);
    setPage(1);
    setItems([]);
  };

  const loadMore = () => {
    if (currentData?.has_next && !isFetching) {
      setItems(page === 1 ? currentData.results : items);
      setPage((p) => p + 1);
    }
  };

  // Đánh dấu đã đọc và điều hướng theo loại thông báo.
  // Thông báo liên quan buổi làm sẽ mở trang đơn hàng,
  // không điều hướng trực tiếp đến trang schedule.
  const pressNotification = (notification: AppNotification) => {
    if (!notification.is_read) {
      markRead(notification.id);
    }

    const route = getNotificationRoute(notification);

    if (route) {
      router.push(route as any);
    }
  };

  const confirmMarkAllRead = () => {
    if (!unreadCount) return;

    Alert.alert(
      t("Đánh dấu tất cả đã đọc"),
      t("Đánh dấu toàn bộ thông báo là đã đọc?"),
      [
        { text: t("Hủy"), style: "cancel" },
        {
          text: t("Đồng ý"),
          onPress: () => markAllRead(),
        },
      ],
    );
  };

  const refresh = () => {
    setPage(1);
    setItems([]);
    if (page === 1) refetch();
  };

  return {
    filter,
    page,
    items: list,
    unreadCount,
    isLoading,
    isFetching,
    isError,
    isMarkingAll,
    changeFilter,
    loadMore,
    pressNotification,
    confirmMarkAllRead,
    refresh,
  };
}
