import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { useGetBookingsQuery } from "@/services/bookingApi";
import { useAppSelector } from "@/store/hooks";
import type { BookingListItem, BookingStatus } from "@/types/Booking";
import {
  BOOKING_STATUS_META,
  BOOKING_STATUS_TABS,
} from "@/utils/bookingStatus";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");

  const { data, isLoading, isFetching, isError, refetch } = useGetBookingsQuery(
    activeTab === "ALL" ? undefined : { status: activeTab },
    { skip: !isAuthenticated },
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity className="w-9 h-9 items-center justify-center rounded-full bg-gray-50">
          <Feather name="menu" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Đơn hàng của tôi
        </Text>
        {isAuthenticated ? (
          <NotificationBellButton />
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 px-5 pt-4">
          <RequireLoginNotice message="Đăng nhập để xem và quản lý các đơn hàng dịch vụ của bạn" />
        </View>
      ) : (
        <View className="flex-1">
          {/* Status Filter Tabs */}
          <View className="bg-white pb-3 pt-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
              }}
            >
              {BOOKING_STATUS_TABS.map((tab) => {
                const selected = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    activeOpacity={0.7}
                    className={`px-4 py-2 rounded-full flex-row items-center ${
                      selected ? "bg-emerald-700" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Content List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#047857" />
            </View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center px-6">
              <Feather name="alert-triangle" size={36} color="#DC2626" />
              <Text className="text-gray-800 font-medium mt-3 text-center">
                Không tải được danh sách đơn hàng
              </Text>
              <TouchableOpacity
                onPress={refetch}
                className="mt-4 px-4 py-2 bg-emerald-700 rounded-xl"
              >
                <Text className="text-white font-semibold text-xs">
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={data?.results ?? []}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              refreshing={isFetching}
              onRefresh={refetch}
              renderItem={({ item }) => <BookingCard item={item} />}
              ListEmptyComponent={
                <View className="items-center justify-center pt-24">
                  <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3">
                    <Feather name="clipboard" size={28} color="#047857" />
                  </View>
                  <Text className="text-gray-800 font-bold text-base">
                    Chưa có đơn hàng nào
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1 text-center px-10">
                    Các đơn hàng dịch vụ bạn đặt sẽ hiển thị ở đây.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

function BookingCard({ item }: { item: BookingListItem }) {
  const meta = BOOKING_STATUS_META[item.status] ?? {
    label: item.status,
    color: "#374151",
    bg: "#F3F4F6",
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm shadow-gray-100"
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/booking/[id]",
          params: { id: String(item.id) },
        })
      }
    >
      {/* Top Info: Code & Status */}
      <View className="flex-row items-center justify-between mb-2.5">
        <View className="flex-row items-center">
          <Feather name="hash" size={13} color="#9CA3AF" />
          <Text className="text-gray-500 text-xs font-medium ml-0.5">
            {item.booking_code}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: meta.bg }}
        >
          <Text className="text-xs font-bold" style={{ color: meta.color }}>
            {meta.label}
          </Text>
        </View>
      </View>

      {/* Service Name */}
      <Text
        className="text-gray-900 font-bold text-base mb-3"
        numberOfLines={2}
      >
        {item.service_name}
      </Text>

      {/* Divider */}
      <View className="h-[1px] bg-gray-50 mb-3" />

      {/* Bottom Info: Date & Price */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather
            name="calendar"
            size={13}
            color="#9CA3AF"
            style={{ marginRight: 4 }}
          />
          <Text className="text-gray-400 text-xs">
            {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </Text>
        </View>
        <Text className="text-emerald-700 font-extrabold text-[15px]">
          {item.total_amount
            ? formatVnd(Number(item.total_amount))
            : "Chờ báo giá"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
