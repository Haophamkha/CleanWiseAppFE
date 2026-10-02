import type { Review } from "@/features/review/types/Review";
import { canEditReview } from "@/features/review/utils/reviewFormat";
import { useEffect, useState } from "react";

export function useReviewEditability(review: Review) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!canEditReview(review)) return;
    const remaining = new Date(review.edit_deadline).getTime() - Date.now();
    // A JS timer cannot exceed about 24.8 days; check again for longer deadlines.
    const timer = setTimeout(
      () => setTick((tick) => tick + 1),
      Math.min(remaining, 2_000_000_000),
    );
    return () => clearTimeout(timer);
  });
  return canEditReview(review);
}
