import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import ScreenContainer from "@/components/ScreenContainer";

import { FavoriteSummaryCard } from "@/features/favorite-worker/components/FavoriteSummaryCard";
import { FavoriteWorkersEmpty } from "@/features/favorite-worker/components/FavoriteWorkersEmpty";
import { FavoriteWorkersError } from "@/features/favorite-worker/components/FavoriteWorkersError";
import { WorkerCard } from "@/features/favorite-worker/components/WorkerCard";
import { useFavoriteWorkers } from "@/features/favorite-worker/hooks/useFavoriteWorkers";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export function FavoriteWorkers() {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const f = useFavoriteWorkers();

  return (
    <ScreenContainer>
      <ScreenHeader title={t("Nhân viên yêu thích")} />

      {!f.isAuthenticated ? (
        <View className="px-5 pt-5">
          <RequireLoginNotice message={t("Đăng nhập để xem danh sách nhân viên yêu thích")} />
        </View>
      ) : f.isInitialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-sm text-ink-muted mt-3">
            {t("Đang tải danh sách...")}</Text>
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
