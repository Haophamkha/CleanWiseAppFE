import { BottomSheet } from "@/components/ui/BottomSheet";
import { COLORS } from "@/constants/theme";
import { ReviewFeedbackButtons } from "@/features/booking/components/ReviewFeedbackButtons";
import { useScheduleReview } from "@/features/review/hooks/useScheduleReview";
import { Feather } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CreateReviewSheet } from "./CreateReviewSheet";
import { EditReviewSheet } from "./EditReviewSheet";
import { ReviewCard } from "./ReviewCard";

export function ScheduleReviewActions({
  assignmentId,
  completed,
  onFeedback,
  style,
}: {
  assignmentId: number | null;
  completed: boolean;
  onFeedback?: () => void;
  style?: object;
}) {
  const r = useScheduleReview(assignmentId, completed);
  const { height } = useWindowDimensions();
  return (
    <>
      <ReviewFeedbackButtons
        onReview={r.open}
        onFeedback={onFeedback}
        style={style}
        reviewTitle={r.title}
        reviewSubtitle={r.subtitle}
        reviewDisabled={r.disabled}
      />
      {r.mode === "create" && r.query.currentData && (
        <CreateReviewSheet
          state={r.query.currentData}
          onClose={r.close}
          onCreated={r.created}
        />
      )}
      {r.mode === "edit" && r.review && (
        <EditReviewSheet
          key={r.review.id}
          review={r.review}
          onClose={r.close}
        />
      )}
      {r.mode === "view" && r.review && (
        <BottomSheet visible onClose={r.close}>
          <View className="px-5 py-3 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-ink">Đánh giá của bạn</Text>
            <Pressable onPress={r.close} hitSlop={10} accessibilityLabel="Đóng">
              <Feather name="x" size={22} color={COLORS.inkSoft} />
            </Pressable>
          </View>
          <ScrollView
            style={{ maxHeight: height * 0.7 }}
            contentContainerStyle={{ padding: 20, paddingTop: 4 }}
          >
            <ReviewCard review={r.review} onEdit={r.edit} />
          </ScrollView>
        </BottomSheet>
      )}
    </>
  );
}
