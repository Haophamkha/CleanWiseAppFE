import { ScreenHeader } from "@/components/common/ScreenHeader";
import NotificationFilterTabs from "@/components/notification/NotificationFilterTabs";
import NotificationItem from "@/components/notification/NotificationItem";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS, SHADOWS } from "@/constants/theme";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const {
    filter,
    page,
    items,
    unreadCount,
    isLoading,
    isFetching,
    isMarkingAll,
    changeFilter,
    loadMore,
    pressNotification,
    confirmMarkAllRead,
    refresh,
  } = useNotifications();

  const canMarkAll = unreadCount > 0 && !isMarkingAll;

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Thông báo"
          right={
            <TouchableOpacity
              onPress={confirmMarkAllRead}
              disabled={!canMarkAll}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center h-10 px-4 rounded-full border ${
                canMarkAll
                  ? "bg-primary border-primary"
                  : "bg-canvas border-line"
              }`}
              style={canMarkAll ? SHADOWS.float : undefined}
            >
              {isMarkingAll ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather
                  name="check-circle"
                  size={18}
                  color={canMarkAll ? "#FFFFFF" : COLORS.inkMuted}
                />
              )}
              <Text
                className={`ml-2 text-sm font-bold ${
                  canMarkAll ? "text-white" : "text-ink-muted"
                }`}
              >
                Đọc tất cả
              </Text>
            </TouchableOpacity>
          }
        />
      </View>

      <NotificationFilterTabs value={filter} onChange={changeFilter} />

      {unreadCount > 0 && (
        <View className="flex-row items-center px-5 pb-2">
          <Badge label={`${unreadCount} chưa đọc`} tone="primary" />
        </View>
      )}

      <FlatList
        key={filter}
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={pressNotification} />
        )}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator className="my-4" color={COLORS.primary} />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-24" color={COLORS.primary} />
          ) : (
            <View className="mt-16">
              <EmptyState icon="bell-off" title="Không có thông báo nào" />
            </View>
          )
        }
      />
    </View>
  );
}
