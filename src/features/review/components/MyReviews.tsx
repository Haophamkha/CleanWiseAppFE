import ScreenContainer from "@/components/ScreenContainer";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Button, EmptyState, Input } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { useMyReviews } from "@/features/review/hooks/useMyReviews";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { EditReviewSheet } from "./EditReviewSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilterSheet } from "./ReviewFilterSheet";

export function MyReviews() {
  const r = useMyReviews();
  return (
    <ScreenContainer>
      <ScreenHeader title="Đánh giá của tôi" />
      {r.isAuthenticated && (
        <View className="px-5 pt-4 pb-2">
          <Input
            icon="search"
            placeholder="Tìm nhân viên, dịch vụ, nội dung..."
            accessibilityLabel="Tìm đánh giá"
            value={r.search}
            onChangeText={r.setSearch}
            maxLength={200}
            autoCorrect={false}
            right={
              r.search ? (
                <Pressable
                  onPress={() => r.setSearch("")}
                  hitSlop={10}
                  accessibilityLabel="Xóa từ khóa"
                >
                  <Feather name="x" size={18} color={COLORS.inkMuted} />
                </Pressable>
              ) : undefined
            }
          />
          <View className="flex-row items-center justify-between mb-2">
            <Button
              title={`Bộ lọc${r.filterLabels.length ? ` (${r.filterLabels.length})` : ""}`}
              icon="sliders"
              variant="outline"
              onPress={r.openFilters}
            />
            {r.hasFilters && (
              <Pressable
                accessibilityRole="button"
                onPress={r.clearFilters}
                hitSlop={8}
              >
                <Text className="text-primary font-semibold">Xóa bộ lọc</Text>
              </Pressable>
            )}
          </View>
          {!!r.filterLabels.length && (
            <View className="flex-row flex-wrap mt-1">
              {r.filterLabels.map((label) => (
                <View
                  key={label}
                  className="bg-primary-light px-3 py-1.5 rounded-full mr-2 mb-2"
                >
                  <Text className="text-primary-dark text-xs">{label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      {!r.isAuthenticated ? (
        <View className="px-5 pt-5">
          <RequireLoginNotice message="Đăng nhập để xem các đánh giá của bạn" />
        </View>
      ) : r.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : r.isError && r.reviews.length === 0 ? (
        <EmptyState
          icon="wifi-off"
          title="Không tải được đánh giá"
          actionLabel="Thử lại"
          onAction={r.refresh}
        />
      ) : (
        <FlatList
          data={r.reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20, flexGrow: 1 }}
          refreshing={r.refreshing}
          onRefresh={r.refresh}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            r.reviews.length > 0 ? (
              <View className="mb-5">
                <Text className="text-ink font-bold text-lg">
                  {r.reviews.length}{" "}
                  {r.hasFilters ? "đánh giá phù hợp" : "đánh giá đã viết"}
                </Text>
                <Text className="text-ink-soft text-sm mt-1">
                  Bạn có thể chỉnh sửa trong 30 ngày kể từ lần gửi đầu tiên.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ReviewCard review={item} onEdit={() => r.edit(item)} />
          )}
          ListEmptyComponent={
            r.refreshing ? (
              <ActivityIndicator
                color={COLORS.primary}
                size="large"
                className="mt-8"
              />
            ) : r.hasFilters ? (
              <EmptyState
                icon="search"
                title="Không tìm thấy đánh giá phù hợp. Thử thay đổi từ khóa hoặc bộ lọc."
                actionLabel="Xóa bộ lọc"
                onAction={r.clearFilters}
              />
            ) : (
              <EmptyState
                icon="star"
                title="Bạn chưa viết đánh giá nào. Hãy đánh giá sau khi buổi làm hoàn thành."
              />
            )
          }
        />
      )}
      {r.isAuthenticated && r.filterOpen && (
        <ReviewFilterSheet
          filters={r.filters}
          onClose={r.closeFilters}
          onApply={r.applyFilters}
        />
      )}
      {r.isAuthenticated && r.editingReview && (
        <EditReviewSheet
          key={r.editingReview.id}
          review={r.editingReview}
          onClose={r.closeEditor}
        />
      )}
    </ScreenContainer>
  );
}
