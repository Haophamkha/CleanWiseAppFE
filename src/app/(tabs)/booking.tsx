import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { BookingCard } from "@/features/booking/components/BookingCard";
import { BookingStatusTabs } from "@/features/booking/components/BookingStatusTabs";
import { useBookingList } from "@/features/booking/hooks/useBookingList";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalize = (s: string) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
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

  const q = normalize(query.trim());
  const filtered = useMemo(
    () =>
      q
        ? items.filter(
            (i) =>
              normalize(i.booking_code).includes(q) ||
              normalize(i.service_name).includes(q),
          )
        : items,
    [items, q],
  );

  return (
    <View className="flex-1 bg-canvas">
      <TabScreenHeader title="Đơn dịch vụ của tôi" />

      {!isAuthenticated ? (
        <View className="flex-1 justify-center px-5 pb-16">
          <RequireLoginNotice message="Đăng nhập để xem và quản lý các đơn hàng dịch vụ của bạn" />
        </View>
      ) : (
        <View className="flex-1">
          {/* Tìm kiếm + tab lọc nằm chung một thanh */}
          <View
            className="bg-surface border-b border-line rounded-t-3xl"
            style={{ marginTop: -20 }}
          >
            <View className="px-5 pt-4">
              <View
                className="flex-row items-center rounded-full bg-canvas px-4 h-12"
                style={{
                  borderWidth: 1.5,
                  borderColor: focused ? COLORS.primary : COLORS.line,
                }}
              >
                <Feather
                  name="search"
                  size={18}
                  color={focused ? COLORS.primary : COLORS.inkMuted}
                />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Tìm theo mã đơn hoặc tên dịch vụ"
                  placeholderTextColor={COLORS.inkMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  className="flex-1 ml-2.5 text-[14px] text-ink"
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setQuery("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather
                      name="x-circle"
                      size={18}
                      color={COLORS.inkMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
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
                    icon={q ? "search" : "clipboard"}
                    title={
                      q
                        ? "Không tìm thấy đơn phù hợp"
                        : "Chưa có đơn hàng nào. Các đơn dịch vụ bạn đặt sẽ hiển thị ở đây."
                    }
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
