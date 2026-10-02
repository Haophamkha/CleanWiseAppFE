import { Button, Input } from "@/components/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { COLORS } from "@/constants/theme";
import { useEditReview } from "@/features/review/hooks/useEditReview";
import { useReviewEditability } from "@/features/review/hooks/useReviewEditability";
import type { Review } from "@/features/review/types/Review";
import {
  formatReviewDate,
  reviewWorkerName,
} from "@/features/review/utils/reviewFormat";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { ReviewStars } from "./ReviewStars";

export function EditReviewSheet({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  const e = useEditReview(review, onClose);
  const editable = useReviewEditability(review);
  const busy = e.isSaving || e.isPicking || !editable;
  return (
    <BottomSheet visible onClose={e.close}>
      <View className="px-5 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-ink">Chỉnh sửa đánh giá</Text>
          <Pressable
            onPress={e.close}
            disabled={e.isSaving}
            hitSlop={10}
            accessibilityLabel="Đóng"
          >
            <Feather name="x" size={22} color={COLORS.inkSoft} />
          </Pressable>
        </View>
        <Text className="text-ink-soft text-sm mt-1">
          {reviewWorkerName(review)}
        </Text>
      </View>
      <ScrollView
        style={{ maxHeight: 420 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      >
        <View className="items-center mb-4">
          <ReviewStars
            rating={e.rating}
            onChange={e.setRating}
            disabled={busy}
          />
          <Text className="text-ink-soft text-sm">{e.rating}/5 sao</Text>
        </View>
        <Input
          label="Nội dung đánh giá"
          value={e.comment}
          onChangeText={e.setComment}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          multiline
          maxLength={3000}
          editable={!busy}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />
        <Text className="text-ink-muted text-xs text-right mb-3">
          {e.comment.length}/3000
        </Text>
        <Text className="text-ink font-semibold text-sm mb-3">
          Ảnh đánh giá ({e.imageCount}/{review.max_images})
        </Text>
        <View className="flex-row flex-wrap">
          {[
            ...e.existingImages.map((image) => ({
              key: `old-${image.id}`,
              uri: image.image,
              remove: () => e.removeExisting(image.id),
            })),
            ...e.newImages.map((image, index) => ({
              key: `new-${index}`,
              uri: image.uri,
              remove: () => e.removeNew(index),
            })),
          ].map((image) => (
            <View key={image.key} className="mr-3 mb-3">
              <Image
                source={{ uri: image.uri }}
                className="w-20 h-20 rounded-xl"
              />
              <Pressable
                onPress={image.remove}
                disabled={busy}
                accessibilityLabel="Bỏ ảnh"
                className="absolute right-1 top-1 bg-surface rounded-full p-1"
              >
                <Feather name="x" size={14} color={COLORS.danger} />
              </Pressable>
            </View>
          ))}
        </View>
        {e.imageCount < review.max_images && (
          <Button
            title={e.isPicking ? "Đang chọn ảnh..." : "Thêm ảnh"}
            icon="image"
            variant="outline"
            onPress={e.addImage}
            disabled={busy}
          />
        )}
        <Text className="text-ink-muted text-xs leading-4 mt-4">
          Hạn chỉnh sửa: {formatReviewDate(review.edit_deadline)}. Thời hạn được
          tính từ lần gửi đầu tiên.
        </Text>
        {!!e.error && (
          <Text accessibilityRole="alert" className="text-danger text-sm mt-3">
            {e.error}
          </Text>
        )}
        {!editable && !e.error && (
          <Text accessibilityRole="alert" className="text-danger text-sm mt-3">
            Đã hết thời hạn chỉnh sửa đánh giá.
          </Text>
        )}
      </ScrollView>
      <View className="px-5 pb-3 pt-3 border-t border-line">
        <Button
          title="Lưu thay đổi"
          onPress={e.save}
          loading={e.isSaving}
          disabled={e.isPicking || !editable}
        />
      </View>
    </BottomSheet>
  );
}
