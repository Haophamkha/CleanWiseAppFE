import { useGetAssignmentReviewQuery } from "@/features/review/api/reviewApi";
import type { Review } from "@/features/review/types/Review";
import { useEffect, useState } from "react";

export function useScheduleReview(
  assignmentId: number | null,
  completed: boolean,
) {
  const query = useGetAssignmentReviewQuery(assignmentId ?? 0, {
    skip: !assignmentId || !completed,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const [mode, setMode] = useState<"create" | "view" | "edit" | null>(null);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);
  useEffect(() => {
    setMode(null);
    setCreatedReview(null);
  }, [assignmentId]);
  useEffect(() => {
    if (query.currentData?.review) setCreatedReview(null);
  }, [query.currentData]);
  const review = createdReview ?? query.currentData?.review;
  const open = () => {
    if (query.isError) {
      void query.refetch();
      return;
    }
    if (review) setMode("view");
    else if (query.currentData?.can_review) setMode("create");
  };
  return {
    query,
    review,
    mode,
    open,
    close: () => setMode(null),
    edit: () => setMode("edit"),
    created: (review: Review) => {
      setCreatedReview(review);
      setMode("view");
    },
    title: review ? "Xem đánh giá" : "Đánh giá",
    subtitle: !completed
      ? "Buổi làm chưa hoàn thành"
      : !assignmentId
        ? "Chưa có nhân viên thực hiện"
        : query.isError
          ? "Không tải được. Chạm để thử lại"
          : query.isLoading
            ? "Đang tải..."
            : review
              ? `Đã gửi ${review.rating}/5 sao`
              : query.currentData?.can_review
                ? "Chia sẻ trải nghiệm"
                : "Chưa thể đánh giá",
    disabled:
      !completed ||
      !assignmentId ||
      query.isLoading ||
      (!query.isError && !review && !query.currentData?.can_review),
  };
}
