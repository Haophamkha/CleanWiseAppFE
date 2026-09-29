import { BookingCard } from "@/components/booking/BookingCard";
import { BookingStatusTabs } from "@/components/booking/BookingStatusTabs";
import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { useBookingList } from "@/features/booking/hooks/useBookingList";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const {
    isAuthenticated,
    activeTab,
    items,
    isError,
    isInitialLoading,
    isLoadingMore,
    refreshing,
    changeTab,
    loadMore,
    refresh,
  } = useBookingList();

  return (
    <View className="flex-1 bg-canvas">
      <View
        className="flex-row items-center justify-between bg-surface px-5 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View>
          <Text className="text-[22px] font-extrabold text-ink">
            Đơn hàng của tôi
          </Text>
          <Text className="text-xs text-ink-muted mt-0.5">
            Theo dõi và quản lý các dịch vụ đã đặt
          </Text>
        </View>
        {isAuthenticated ? (
          <View className="w-10 h-10 rounded-full bg-canvas items-center justify-center">
            <NotificationBellButton />
          </View>
        ) : null}
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 px-5 pt-4">
          <RequireLoginNotice message="Đăng nhập để xem và quản lý các đơn hàng dịch vụ của bạn" />
        </View>
      ) : (
        <View className="flex-1">
          <View className="bg-surface border-b border-line">
            <BookingStatusTabs value={activeTab} onChange={changeTab} />
          </View>

          {isInitialLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : isError && items.length === 0 ? (
            <View className="flex-1 justify-center">
              <EmptyState
                icon="alert-triangle"
                title="Không tải được danh sách đơn hàng"
                actionLabel="Thử lại"
                onAction={refresh}
              />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 100 + insets.bottom,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refresh}
                  tintColor={COLORS.primary}
                  colors={[COLORS.primary]}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              renderItem={({ item }) => <BookingCard item={item} />}
              ListFooterComponent={
                isLoadingMore ? (
                  <ActivityIndicator className="py-4" color={COLORS.primary} />
                ) : null
              }
              ListEmptyComponent={
                <View className="pt-16">
                  <EmptyState
                    icon="clipboard"
                    title="Chưa có đơn hàng nào. Các đơn dịch vụ bạn đặt sẽ hiển thị ở đây."
                  />
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}
