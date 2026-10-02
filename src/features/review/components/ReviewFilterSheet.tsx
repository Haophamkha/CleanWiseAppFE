import { Button, Input } from "@/components/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { COLORS } from "@/constants/theme";
import {
  DEFAULT_REVIEW_FILTERS,
  displayFilterDate,
  parseFilterDate,
  REVIEW_PERIOD_LABELS,
} from "@/features/review/utils/reviewFilters";
import type { ReviewFilters } from "@/features/review/types/ReviewFilters";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

function Choice({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`px-4 py-2.5 rounded-full border mr-2 mb-2 ${selected ? "bg-primary-light border-primary" : "bg-surface border-line"}`}
    >
      <Text
        className={`text-sm font-medium ${selected ? "text-primary-dark" : "text-ink-soft"}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function ReviewFilterSheet({
  filters,
  onClose,
  onApply,
}: {
  filters: ReviewFilters;
  onClose: () => void;
  onApply: (filters: ReviewFilters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const [from, setFrom] = useState(displayFilterDate(filters.date_from));
  const [to, setTo] = useState(displayFilterDate(filters.date_to));
  const [error, setError] = useState("");
  const { height } = useWindowDimensions();
  function apply() {
    const date_from = parseFilterDate(from);
    const date_to = parseFilterDate(to);
    if (
      draft.period === "custom" &&
      (!date_from || !date_to || date_from > date_to)
    ) {
      setError(
        "Nhập ngày hợp lệ theo dd/mm/yyyy; ngày bắt đầu phải trước hoặc bằng ngày kết thúc.",
      );
      return;
    }
    onApply({
      ...draft,
      date_from: draft.period === "custom" ? date_from! : undefined,
      date_to: draft.period === "custom" ? date_to! : undefined,
    });
  }
  return (
    <BottomSheet visible onClose={onClose}>
      <View className="flex-row justify-between items-center px-5 py-3">
        <Text className="text-xl font-bold text-ink">Bộ lọc đánh giá</Text>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityLabel="Đóng bộ lọc"
        >
          <Feather name="x" size={22} color={COLORS.inkSoft} />
        </Pressable>
      </View>
      <ScrollView
        style={{ maxHeight: height * 0.6 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
      >
        <Text className="font-semibold text-ink mb-3">Số sao</Text>
        <View className="flex-row flex-wrap mb-3">
          {[undefined, 1, 2, 3, 4, 5].map((rating) => (
            <Choice
              key={rating ?? "all"}
              title={rating ? `${rating} sao` : "Tất cả"}
              selected={draft.rating === rating}
              onPress={() => setDraft({ ...draft, rating })}
            />
          ))}
        </View>
        <Text className="font-semibold text-ink mb-3">Thời gian đánh giá</Text>
        <View className="flex-row flex-wrap mb-3">
          {(Object.keys(REVIEW_PERIOD_LABELS) as ReviewFilters["period"][]).map(
            (period) => (
              <Choice
                key={period}
                title={REVIEW_PERIOD_LABELS[period]}
                selected={draft.period === period}
                onPress={() => {
                  setError("");
                  setDraft({ ...draft, period });
                }}
              />
            ),
          )}
        </View>
        {draft.period === "custom" && (
          <View>
            <Input
              label="Từ ngày"
              placeholder="dd/mm/yyyy"
              value={from}
              onChangeText={(value) => {
                setFrom(value);
                setError("");
              }}
              maxLength={10}
              keyboardType="numbers-and-punctuation"
              invalid={!!error}
            />
            <Input
              label="Đến ngày"
              placeholder="dd/mm/yyyy"
              value={to}
              onChangeText={(value) => {
                setTo(value);
                setError("");
              }}
              maxLength={10}
              keyboardType="numbers-and-punctuation"
              invalid={!!error}
            />
          </View>
        )}
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-ink">Còn hạn chỉnh sửa</Text>
            <Text className="text-sm text-ink-soft mt-1">
              Trong 30 ngày kể từ lần gửi đầu tiên
            </Text>
          </View>
          <Switch
            accessibilityLabel="Chỉ hiện đánh giá còn hạn chỉnh sửa"
            value={draft.editable_only}
            onValueChange={(editable_only) =>
              setDraft({ ...draft, editable_only })
            }
            trackColor={{ false: COLORS.line, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>
        <Text className="font-semibold text-ink mb-3">Sắp xếp</Text>
        <View className="flex-row flex-wrap">
          <Choice
            title="Mới nhất trước"
            selected={draft.ordering === "newest"}
            onPress={() => setDraft({ ...draft, ordering: "newest" })}
          />
          <Choice
            title="Cũ nhất trước"
            selected={draft.ordering === "oldest"}
            onPress={() => setDraft({ ...draft, ordering: "oldest" })}
          />
        </View>
        {!!error && (
          <Text accessibilityRole="alert" className="text-danger text-sm mt-2">
            {error}
          </Text>
        )}
      </ScrollView>
      <View className="px-5 pt-3 border-t border-line gap-3">
        <Button title="Áp dụng bộ lọc" onPress={apply} />
        <Button
          title="Đặt lại bộ lọc"
          variant="outline"
          onPress={() => {
            setDraft(DEFAULT_REVIEW_FILTERS);
            setFrom("");
            setTo("");
            setError("");
          }}
        />
      </View>
    </BottomSheet>
  );
}
