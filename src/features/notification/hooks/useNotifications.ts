import { NotificationFilter } from "@/components/notification/NotificationFilterTabs";
import {
    notificationApi,
    useGetNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation,
} from "@/services/notificationApi";
import { AppNotification } from "@/types/Notification";
import { NOTIFICATION_FILTER_OPTIONS } from "@/utils/notificationMeta";
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
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AppNotification[]>([]); // dùng cho page > 1

  const queryParams = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      ...(filter !== "ALL" ? { type: filter } : {}),
    }),
    [filter, page],
  );

  // currentData: chỉ có dữ liệu đúng tham số hiện tại, không giữ data tab cũ
  const { currentData, isFetching, refetch } =
    useGetNotificationsQuery(queryParams);
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const prefetch = notificationApi.usePrefetch("getNotifications");

  // Nối trang > 1 (chống trùng)
  useEffect(() => {
    if (page > 1 && currentData) {
      setItems((prev) => dedupe([...prev, ...currentData.results]));
    }
  }, [currentData, page]);

  // Tab hiện tại tải xong mới prefetch các tab khác, lần lượt từng tab
  const firstPageLoaded = page === 1 && !!currentData;
  useEffect(() => {
    if (!firstPageLoaded) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    NOTIFICATION_FILTER_OPTIONS.filter((o) => o.value !== filter).forEach(
      (opt, i) => {
        timers.push(
          setTimeout(
            () =>
              prefetch(
                {
                  page: 1,
                  page_size: PAGE_SIZE,
                  ...(opt.value !== "ALL" ? { type: opt.value as any } : {}),
                },
                { ifOlderThan: 60 },
              ),
            (i + 1) * PREFETCH_GAP_MS,
          ),
        );
      },
    );
    return () => timers.forEach(clearTimeout);
  }, [firstPageLoaded, filter, prefetch]);

  const list = page === 1 ? (currentData?.results ?? []) : items;
  const unreadCount = currentData?.unread_count ?? 0;
  // Đang tải trang đầu của tab (chưa có dữ liệu để hiện)
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

  const pressNotification = (notification: AppNotification) => {
    if (!notification.is_read) markRead(notification.id);
    if (notification.related_booking) {
      router.push(`/booking/${notification.related_booking}` as any);
    }
  };

  const confirmMarkAllRead = () => {
    if (!unreadCount) return;
    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      "Đánh dấu toàn bộ thông báo là đã đọc?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => markAllRead() },
      ],
    );
  };

  const refresh = () => {
    setPage(1);
    setItems([]);
    refetch();
  };

  return {
    filter,
    page,
    items: list,
    unreadCount,
    isLoading,
    isFetching,
    isMarkingAll,
    changeFilter,
    loadMore,
    pressNotification,
    confirmMarkAllRead,
    refresh,
  };
}
