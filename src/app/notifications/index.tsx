import NotificationFilterTabs, {
    NotificationFilter,
} from "@/components/notification/NotificationFilterTabs";
import NotificationItem from "@/components/notification/NotificationItem";
import { useAppDispatch } from "@/store/hooks";
import { setUnreadCount } from "@/store/notificationSlice";
import { AppNotification } from "@/types/Notification";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// TODO: thay bằng GET /api/notifications/ khi BE sẵn sàng.
// Field đặt tên khớp bảng notifications trong DB.
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    user_id: 101,
    title: "Nhân viên đã nhận đơn",
    message:
      "Nhân viên Nguyễn Thị A đã nhận đơn dọn dẹp nhà của bạn và sẽ đến vào đúng giờ đã hẹn.",
    type: "BOOKING",
    related_booking_id: 8829,
    is_read: false,
    read_at: null,
    created_at: new Date(NOW - 20 * 1000).toISOString(),
  },
  {
    id: 2,
    user_id: 101,
    title: "Thanh toán thành công",
    message:
      "Bạn đã thanh toán thành công 350.000đ cho đơn hàng #CC-8829. Cảm ơn bạn đã sử dụng dịch vụ.",
    type: "PAYMENT",
    related_booking_id: 8829,
    is_read: true,
    read_at: new Date(NOW - DAY - 3 * HOUR).toISOString(),
    created_at: new Date(NOW - DAY - 3 * HOUR).toISOString(),
  },
  {
    id: 3,
    user_id: 101,
    title: "Bạn có voucher giảm 20%",
    message:
      "Cuối tuần thảnh thơi, CleanWise tặng bạn mã CUOITUAN giảm 20% (tối đa 50.000đ) cho đơn tiếp theo.",
    type: "PROMOTION",
    related_booking_id: null,
    is_read: true,
    read_at: new Date(NOW - 19 * DAY).toISOString(),
    created_at: new Date(NOW - 19 * DAY).toISOString(),
  },
  {
    id: 4,
    user_id: 101,
    title: "Đánh giá dịch vụ",
    message:
      "Đơn hàng #CC-8828 đã hoàn thành. Hãy dành chút thời gian đánh giá chất lượng dịch vụ nhé.",
    type: "REVIEW",
    related_booking_id: 8828,
    is_read: true,
    read_at: new Date(NOW - 20 * DAY).toISOString(),
    created_at: new Date(NOW - 20 * DAY).toISOString(),
  },
];

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications],
  );

  // Đồng bộ badge chuông ở các màn khác theo danh sách hiện tại.
  useEffect(() => {
    dispatch(setUnreadCount(unreadCount));
  }, [unreadCount, dispatch]);

  const filteredNotifications = useMemo(() => {
    if (filter === "ALL") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const handlePressNotification = (notification: AppNotification) => {
    if (!notification.is_read) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
    }
    // TODO: khi có trang chi tiết đơn hàng, điều hướng theo related_booking_id
    // ví dụ: if (notification.related_booking_id) router.push(`/bookings/${notification.related_booking_id}`)
    // TODO: gọi API PATCH đánh dấu đã đọc khi BE sẵn sàng
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      "Xóa tất cả thông báo",
      "Bạn có chắc muốn xóa toàn bộ thông báo?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: () => {
            // TODO: gọi API xóa tất cả thông báo khi BE sẵn sàng
            setNotifications([]);
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: gọi lại API lấy danh sách thông báo khi BE sẵn sàng
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-900">Thông báo</Text>

        <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
          <Text className="text-red-600 text-sm font-semibold">Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <NotificationFilterTabs value={filter} onChange={setFilter} />

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handlePressNotification}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-24">
            <Feather name="bell-off" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3">Không có thông báo nào</Text>
          </View>
        }
      />
    </View>
  );
}
