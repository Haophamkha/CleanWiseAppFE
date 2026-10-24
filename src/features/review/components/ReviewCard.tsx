import { useTranslation } from "react-i18next";

import { RADIUS, SHADOWS } from "@/constants/theme";
import type { Review } from "@/features/review/types/Review";
import { useReviewEditability } from "@/features/review/hooks/useReviewEditability";
import {
  formatReviewDate,
  reviewWorkerName,
} from "@/features/review/utils/reviewFormat";
import { Button } from "@/components/ui";
import { Image, ScrollView, Text, View } from "react-native";
import { ReviewStars } from "./ReviewStars";

export function ReviewCard({
  review,
  onEdit,
}: {
  review: Review;
  onEdit: () => void;
}) {
  const { t } = useTranslation();

  const editable = useReviewEditability(review);
  return (
    <View
      className="bg-surface border border-line p-5 mb-4"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="flex-1 text-ink font-bold text-base mr-3">
          {reviewWorkerName(review)}
        </Text>
        <ReviewStars rating={review.rating} />
      </View>
      <Text className="text-primary-dark font-semibold text-sm">
        {review.service_name}
      </Text>
      <Text className="text-ink-soft text-xs mt-1">
        {review.booking_code}  {t("· Buổi")} {review.schedule.sequence_no}
      </Text>
      <Text className="text-ink-muted text-xs mt-1">
        {t("Ngày làm:")}{" "}{formatReviewDate(review.schedule.scheduled_start)}
      </Text>
      {!!review.comment && (
        <Text className="text-ink text-sm leading-5 mt-4">
          {review.comment}
        </Text>
      )}
      {review.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
        >
          {review.images.map((image) => (
            <Image
              key={image.id}
              source={{ uri: image.image }}
              accessibilityLabel={t("Ảnh đánh giá")}
              className="w-24 h-24 rounded-xl mr-2"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      {!!review.admin_reply && (
        <View className="bg-primary-soft border border-primary-border rounded-xl p-3 mt-4">
          <Text className="text-primary-dark text-xs font-bold mb-1">
            {t("Phản hồi từ CleanWise")}</Text>
          <Text className="text-ink-soft text-sm leading-5">
            {review.admin_reply}
          </Text>
        </View>
      )}
      {!review.is_visible && (
        <Text className="text-danger text-xs mt-3">
          {t("Đánh giá đang được ẩn khỏi hiển thị công khai.")}</Text>
      )}
      <Text className="text-ink-muted text-xs mt-4">
        {t("Đã gửi:")}{" "}{formatReviewDate(review.created_at)}
        {review.is_edited ? t(" · Đã chỉnh sửa") : ""}
      </Text>
      <View className="mt-3 pt-3 border-t border-line">
        <Text className="text-ink-soft text-xs mb-3">
          {editable
            ? t("Có thể sửa đến {{value0}}", { value0: formatReviewDate(review.edit_deadline) })
            : t("Đã hết thời hạn chỉnh sửa")}
        </Text>
        {editable && (
          <Button
            title={t("Chỉnh sửa đánh giá")}
            variant="soft"
            icon="edit-3"
            onPress={onEdit}
          />
        )}
      </View>
    </View>
  );
}
