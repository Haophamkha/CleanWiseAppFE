import NotificationFilterTabs, {
  NotificationFilter,
} from "@/components/notification/NotificationFilterTabs";
import NotificationItem from "@/components/notification/NotificationItem";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/services/notificationApi";
import { AppNotification } from "@/types/Notification";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<AppNotification[]>([]);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: 20,
      ...(filter !== "ALL" ? { type: filter } : {}),
    }),
    [filter, page],
  );

  const { data, isFetching, isLoading, refetch } =
    useGetNotificationsQuery(queryParams);
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const items = page === 1 ? (data?.results ?? []) : accumulated;

  const handleChangeFilter = (value: NotificationFilter) => {
    setFilter(value);
    setPage(1);
    setAccumulated([]);
  };

  const handleLoadMore = () => {
    if (data?.has_next && !isFetching) {
      setAccumulated([
        ...(page === 1 ? data.results : accumulated),
        ...(data.results ?? []),
      ]);
      setPage((p) => p + 1);
    }
  };

  const handlePressNotification = (notification: AppNotification) => {
    if (!notification.is_read) markRead(notification.id);
    if (notification.related_booking) {
      router.push(`/booking/${notification.related_booking}` as any);
    }
  };

  const handleMarkAllRead = () => {
    if (!data?.unread_count) return;
    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      "Đánh dấu toàn bộ thông báo là đã đọc?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => markAllRead() },
      ],
    );
  };

  const handleRefresh = () => {
    setPage(1);
    setAccumulated([]);
    refetch();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-900">Thông báo</Text>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          activeOpacity={0.7}
          disabled={isMarkingAll || !data?.unread_count}
        >
          <Text
            className={`text-sm font-semibold ${
              data?.unread_count ? "text-emerald-600" : "text-gray-300"
            }`}
          >
            Đọc tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <NotificationFilterTabs value={filter} onChange={handleChangeFilter} />

      <FlatList
        key={filter}
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handlePressNotification}
          />
        )}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator className="my-4" color="#047857" />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center mt-24">
              <Feather name="bell-off" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3">Không có thông báo nào</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
