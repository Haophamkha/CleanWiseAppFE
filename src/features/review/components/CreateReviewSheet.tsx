import { Button, Input } from "@/components/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { COLORS } from "@/constants/theme";
import { useCreateReview } from "@/features/review/hooks/useCreateReview";
import type {
  AssignmentReviewState,
  Review,
} from "@/features/review/types/Review";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { ReviewStars } from "./ReviewStars";

export function CreateReviewSheet({
  state,
  onClose,
  onCreated,
}: {
  state: AssignmentReviewState;
  onClose: () => void;
  onCreated: (review: Review) => void;
}) {
  const r = useCreateReview(state, onCreated, onClose);
  const busy = r.isSaving || r.isPicking;
  const { height } = useWindowDimensions();
  const a = state.assignment;
  return (
    <BottomSheet visible onClose={r.close}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-ink">Đánh giá buổi làm</Text>
        <Pressable
          onPress={r.close}
          disabled={r.isSaving}
          hitSlop={10}
          accessibilityLabel="Đóng"
        >
          <Feather name="x" size={22} color={COLORS.inkSoft} />
        </Pressable>
      </View>
      <ScrollView
        style={{ maxHeight: height * 0.6 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        <Text className="text-primary-dark font-semibold">
          {a.service_name}
        </Text>
        <Text className="text-ink font-semibold mt-1">
          {`${a.worker.last_name} ${a.worker.first_name}`.trim() ||
            a.worker.username}
        </Text>
        <Text className="text-ink-soft text-xs mt-1 mb-4">
          {a.booking_code} · Buổi {a.schedule.sequence_no} ·{" "}
          {formatReviewDate(a.schedule.scheduled_start)}
        </Text>
        <View className="items-center mb-4">
          <ReviewStars
            rating={r.rating}
            onChange={r.setRating}
            disabled={busy}
          />
          <Text className="text-ink-soft text-sm">
            {r.rating
              ? `${r.rating}/5 sao`
              : "Chọn số sao cho trải nghiệm của bạn"}
          </Text>
        </View>
        <Input
          label="Nội dung đánh giá"
          placeholder="Chia sẻ trải nghiệm của bạn..."
          multiline
          textAlignVertical="top"
          style={{ minHeight: 100 }}
          maxLength={3000}
          value={r.comment}
          onChangeText={r.setComment}
          editable={!busy}
        />
        <Text className="text-ink-muted text-xs text-right mb-3">
          {r.comment.length}/3000
        </Text>
        <Text className="text-ink font-semibold text-sm mb-3">
          Ảnh đánh giá ({r.images.length}/{state.max_images})
        </Text>
        <View className="flex-row flex-wrap">
          {r.images.map((image, index) => (
            <View key={`${image.uri}-${index}`} className="mr-3 mb-3">
              <Image
                source={{ uri: image.uri }}
                className="w-20 h-20 rounded-xl"
              />
              <Pressable
                onPress={() => r.removeImage(index)}
                disabled={busy}
                accessibilityLabel="Bỏ ảnh"
                className="absolute right-1 top-1 bg-surface rounded-full p-1"
              >
                <Feather name="x" size={14} color={COLORS.danger} />
              </Pressable>
            </View>
          ))}
        </View>
        {r.images.length < state.max_images && (
          <Button
            title={r.isPicking ? "Đang chọn ảnh..." : "Thêm ảnh"}
            icon="image"
            variant="outline"
            onPress={r.addImage}
            disabled={busy}
          />
        )}
        <Text className="text-ink-muted text-xs leading-4 mt-4">
          Mỗi buổi chỉ được đánh giá một lần. Bạn có thể chỉnh sửa trong 30 ngày
          sau khi gửi; không thể xóa đánh giá.
        </Text>
        {!!r.error && (
          <Text accessibilityRole="alert" className="text-danger text-sm mt-3">
            {r.error}
          </Text>
        )}
      </ScrollView>
      <View className="px-5 pt-3 border-t border-line">
        <Button
          title="Gửi đánh giá"
          onPress={r.submit}
          loading={r.isSaving}
          disabled={r.isPicking}
        />
      </View>
    </BottomSheet>
  );
}
