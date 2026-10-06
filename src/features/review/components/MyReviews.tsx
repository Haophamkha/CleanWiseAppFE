import ScreenContainer from "@/components/ScreenContainer";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyState, Input } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { MyComplaints } from "@/features/complaint/components/MyComplaints";
import { useMyReviews } from "@/features/review/hooks/useMyReviews";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EditReviewSheet } from "./EditReviewSheet";
import { ReviewCard } from "./ReviewCard";
import { ReviewFilterSheet } from "./ReviewFilterSheet";

type Tab = "reviews" | "complaints";

const TABS: { key: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] =
  [
    { key: "reviews", label: "Đánh giá", icon: "star" },
    { key: "complaints", label: "Khiếu nại", icon: "alert-circle" },
  ];

function SegmentedTabs({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <View className="px-5 pt-4">
      <View className="flex-row bg-line rounded-2xl p-1">
        {TABS.map((t) => {
          const selected = value === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.85}
              onPress={() => onChange(t.key)}
              className={`flex-1 h-10 rounded-xl flex-row items-center justify-center ${
                selected ? "bg-surface" : ""
              }`}
            >
              <Feather
                name={t.icon}
                size={15}
                color={selected ? COLORS.primary : COLORS.inkMuted}
              />
              <Text
                className={`ml-1.5 text-sm font-bold ${
                  selected ? "text-primary-dark" : "text-ink-soft"
                }`}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function ReviewsTab({ r }: { r: ReturnType<typeof useMyReviews> }) {
  return (
    <View className="flex-1">
      <View className="px-5 pt-3">
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
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={r.openFilters}
            activeOpacity={0.85}
            className="flex-row items-center h-9 px-3.5 rounded-full border border-line bg-surface"
          >
            <Feather name="sliders" size={14} color={COLORS.inkSoft} />
            <Text className="text-ink-soft text-[13px] font-semibold ml-1.5">
              Bộ lọc{r.filterLabels.length ? ` (${r.filterLabels.length})` : ""}
            </Text>
          </TouchableOpacity>
          {r.hasFilters && (
            <Pressable onPress={r.clearFilters} hitSlop={8}>
              <Text className="text-primary font-semibold text-[13px]">
                Xóa bộ lọc
              </Text>
            </Pressable>
          )}
        </View>
        {!!r.filterLabels.length && (
          <View className="flex-row flex-wrap mt-3">
            {r.filterLabels.map((label) => (
              <View
                key={label}
                className="bg-primary-light px-3 py-1.5 rounded-full mr-2 mb-1"
              >
                <Text className="text-primary-dark text-xs">{label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {r.isLoading ? (
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
              <View className="mb-4">
                <Text className="text-ink font-bold text-base">
                  {r.reviews.length}{" "}
                  {r.hasFilters ? "đánh giá phù hợp" : "đánh giá đã viết"}
                </Text>
                <Text className="text-ink-muted text-xs mt-0.5">
                  Có thể chỉnh sửa trong 30 ngày kể từ lần gửi đầu tiên.
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
    </View>
  );
}

export function MyReviews() {
  const r = useMyReviews();
  const [tab, setTab] = useState<Tab>("reviews");

  return (
    <ScreenContainer>
      <ScreenHeader title="Đánh giá và khiếu nại" />

      {!r.isAuthenticated ? (
        <View className="px-5 pt-5">
          <RequireLoginNotice message="Đăng nhập để xem đánh giá và khiếu nại của bạn" />
        </View>
      ) : (
        <View className="flex-1">
          <SegmentedTabs value={tab} onChange={setTab} />
          {tab === "reviews" ? <ReviewsTab r={r} /> : <MyComplaints />}
        </View>
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
