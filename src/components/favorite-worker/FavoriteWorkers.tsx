import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { FavoriteSummaryCard } from "@/components/favorite-worker/FavoriteSummaryCard";
import { FavoriteWorkersEmpty } from "@/components/favorite-worker/FavoriteWorkersEmpty";
import { FavoriteWorkersError } from "@/components/favorite-worker/FavoriteWorkersError";
import { WorkerCard } from "@/components/favorite-worker/WorkerCard";
import ScreenContainer from "@/components/ScreenContainer";
import { COLORS } from "@/constants/theme";
import { useFavoriteWorkers } from "@/features/favorite-worker/hooks/useFavoriteWorkers";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export function FavoriteWorkers() {
  const f = useFavoriteWorkers();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nhân viên yêu thích" />

      {!f.isAuthenticated ? (
        <View className="px-5 pt-5">
          <RequireLoginNotice message="Đăng nhập để xem danh sách nhân viên yêu thích" />
        </View>
      ) : f.isInitialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-sm text-ink-muted mt-3">
            Đang tải danh sách...
          </Text>
        </View>
      ) : f.hasError ? (
        <FavoriteWorkersError onRetry={() => f.retry()} />
      ) : (
        <FlatList
          data={f.workers}
          keyExtractor={(item) => String(item.worker_id)}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={f.refreshing}
          onRefresh={f.refresh}
          onEndReached={f.loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            f.workers.length > 0 ? (
              <FavoriteSummaryCard count={f.count} />
            ) : null
          }
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              removing={f.removingId === item.worker_id}
              onRemove={() => f.remove(item)}
            />
          )}
          ListFooterComponent={
            f.isLoadingMore ? (
              <ActivityIndicator
                style={{ paddingVertical: 16 }}
                color={COLORS.primary}
              />
            ) : null
          }
          ListEmptyComponent={<FavoriteWorkersEmpty />}
        />
      )}
    </ScreenContainer>
  );
}
