import { EmptyState } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { ComplaintCard } from "@/features/complaint/components/ComplaintCard";
import { ComplaintDetailModal } from "@/features/complaint/components/ComplaintDetailModal";
import {
    useMyComplaints,
    type ComplaintFilter,
} from "@/features/complaint/hooks/useMyComplaints";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const FILTERS: { key: ComplaintFilter; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "IN_REVIEW", label: "Đang xem xét" },
  { key: "RESOLVED", label: "Đã giải quyết" },
  { key: "REJECTED", label: "Bị từ chối" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export function MyComplaints() {
  const c = useMyComplaints();

  return (
    <View className="flex-1">
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          {FILTERS.map((f) => {
            const selected = c.filter === f.key;
            const n = c.counts[f.key] ?? 0;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => c.setFilter(f.key)}
                activeOpacity={0.85}
                className={`h-9 px-4 rounded-full border flex-row items-center ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-surface border-line"
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    selected ? "text-white" : "text-ink-soft"
                  }`}
                >
                  {f.label}
                  {n > 0 ? ` (${n})` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {c.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : c.isError && c.items.length === 0 ? (
        <EmptyState
          icon="wifi-off"
          title="Không tải được khiếu nại"
          actionLabel="Thử lại"
          onAction={c.refresh}
        />
      ) : (
        <FlatList
          data={c.items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 20, paddingTop: 10, flexGrow: 1 }}
          refreshing={c.refreshing}
          onRefresh={c.refresh}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ComplaintCard item={item} onPress={() => c.open(item.id)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="message-square"
              title={
                c.filter === "ALL"
                  ? "Bạn chưa gửi khiếu nại nào. Bạn có thể khiếu nại từ chi tiết buổi làm."
                  : "Không có khiếu nại ở trạng thái này."
              }
            />
          }
        />
      )}

      <ComplaintDetailModal id={c.selectedId} onClose={c.close} />
    </View>
  );
}
