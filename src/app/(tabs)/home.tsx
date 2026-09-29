import { ActiveBookingCard } from "@/components/home/ActiveBookingCard";
import { GuestBanner } from "@/components/home/GuestBanner";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeVoucherCard } from "@/components/home/HomeVoucherCard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ServiceCard } from "@/components/home/ServiceCard";
import { EmptyState } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { useHome } from "@/features/home/hooks/useHome";
import { router } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function HomeScreen() {
  const h = useHome();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={h.refreshing}
            onRefresh={h.onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <HomeHeader
          isAuthenticated={h.isAuthenticated}
          name={h.displayName}
          query={h.query}
          onChangeQuery={h.setQuery}
        />

        <View className="px-5 pt-5">
          {!h.isAuthenticated && <GuestBanner />}

          {h.activeBookings.length > 0 && !h.isSearching && (
            <View className="mb-3">
              <SectionHeader
                title="Đơn đang diễn ra"
                onSeeAll={() => router.push("/(tabs)/booking" as any)}
              />
              {h.activeBookings.map((b) => (
                <ActiveBookingCard
                  key={b.id}
                  booking={b}
                  onPress={() => router.push(`/booking/${b.id}` as any)}
                />
              ))}
            </View>
          )}

          <SectionHeader title="Dịch vụ" />
          {h.servicesLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : h.servicesError ? (
            <EmptyState
              icon="wifi-off"
              title="Không tải được danh sách dịch vụ"
              actionLabel="Thử lại"
              onAction={h.retryServices}
            />
          ) : h.services.length === 0 ? (
            <EmptyState
              icon="search"
              title={
                h.isSearching
                  ? "Không tìm thấy dịch vụ phù hợp"
                  : "Chưa có dịch vụ nào"
              }
            />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {h.services.map((item) => (
                <ServiceCard
                  key={item.id}
                  code={item.code}
                  sectionCode={item.section_code}
                  name={item.name}
                  description={item.description}
                  onPress={() => router.push(`/services/${item.id}` as any)}
                />
              ))}
            </View>
          )}
        </View>

        {h.vouchers.length > 0 && !h.isSearching && (
          <View className="mt-2">
            <View className="px-5">
              <SectionHeader
                title="Ưu đãi cho bạn"
                onSeeAll={() => router.push("/vouchers" as any)}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {h.vouchers.map((v) => (
                <HomeVoucherCard
                  key={v.id}
                  voucher={v}
                  onPress={() => router.push("/vouchers" as any)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
