import type { Review } from "@/features/review/types/Review";

export function canEditReview(review: Review) {
  return (
    review.can_edit && Date.now() < new Date(review.edit_deadline).getTime()
  );
}

export function formatReviewDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function reviewWorkerName(review: Review) {
  return (
    `${review.worker.last_name} ${review.worker.first_name}`.trim() ||
    review.worker.username
  );
}
