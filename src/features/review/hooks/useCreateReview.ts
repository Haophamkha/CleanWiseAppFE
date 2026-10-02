import { useCreateReviewMutation } from "@/features/review/api/reviewApi";
import type {
  AssignmentReviewState,
  Review,
  ReviewPickedImage,
} from "@/features/review/types/Review";
import { getApiErrorMessage } from "@/utils/apiError";
import { pickImage } from "@/utils/imagePicker";
import { showSuccessToast } from "@/utils/toast";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useCreateReview(
  state: AssignmentReviewState,
  onCreated: (review: Review) => void,
  onClose: () => void,
) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<ReviewPickedImage[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [isPicking, setPicking] = useState(false);
  const saving = useRef(false);
  const picking = useRef(false);
  const closed = useRef(false);
  const [createReview] = useCreateReviewMutation();
  useEffect(() => {
    closed.current = false;
    return () => {
      closed.current = true;
    };
  }, []);
  const close = () => {
    if (!saving.current) {
      closed.current = true;
      onClose();
    }
  };
  const addImage = async () => {
    if (saving.current || picking.current || images.length >= state.max_images)
      return;
    picking.current = true;
    setPicking(true);
    try {
      const image = await pickImage();
      if (image && !closed.current) {
        const picked = {
          uri: image.uri,
          name: image.name ?? "review.jpg",
          type: image.type ?? "image/jpeg",
        };
        if (!["image/jpeg", "image/png", "image/webp"].includes(picked.type))
          setError("Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.");
        else {
          setImages((current) => [...current, picked]);
          setError("");
        }
      }
    } catch {
      if (!closed.current) setError("Không thể chọn ảnh. Vui lòng thử lại.");
    } finally {
      picking.current = false;
      if (!closed.current) setPicking(false);
    }
  };
  const submit = async () => {
    if (saving.current || picking.current) return;
    if (!state.can_review) {
      setError("Buổi làm này không còn đủ điều kiện đánh giá.");
      return;
    }
    if (rating < 1) {
      setError("Vui lòng chọn số sao trước khi gửi.");
      return;
    }
    saving.current = true;
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("assignment_id", String(state.assignment.assignment_id));
      data.append("rating", String(rating));
      data.append("comment", comment.trim());
      for (const image of images) {
        if (Platform.OS === "web")
          data.append(
            "images",
            await (await fetch(image.uri)).blob(),
            image.name,
          );
        else data.append("images", image as unknown as Blob);
      }
      const review = await createReview(data).unwrap();
      showSuccessToast("Đã gửi đánh giá", "Cảm ơn bạn đã chia sẻ trải nghiệm.");
      if (!closed.current) onCreated(review);
    } catch (err) {
      if (!closed.current)
        setError(
          getApiErrorMessage(err, "Không thể gửi đánh giá. Vui lòng thử lại."),
        );
    } finally {
      saving.current = false;
      if (!closed.current) setSaving(false);
    }
  };
  return {
    rating,
    setRating,
    comment,
    setComment,
    images,
    error,
    isSaving,
    isPicking,
    close,
    addImage,
    submit,
    removeImage: (index: number) =>
      setImages((current) => current.filter((_, i) => i !== index)),
  };
}
