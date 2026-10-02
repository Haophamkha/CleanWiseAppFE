import { useUpdateReviewMutation } from "@/features/review/api/reviewApi";
import type { Review, ReviewPickedImage } from "@/features/review/types/Review";
import { canEditReview } from "@/features/review/utils/reviewFormat";
import { getApiErrorMessage } from "@/utils/apiError";
import { pickImage } from "@/utils/imagePicker";
import { showSuccessToast } from "@/utils/toast";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useEditReview(review: Review, onClose: () => void) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<ReviewPickedImage[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setSaving] = useState(false);
  const [isPicking, setPicking] = useState(false);
  const savingRef = useRef(false);
  const pickingRef = useRef(false);
  const closedRef = useRef(false);
  const [updateReview] = useUpdateReviewMutation();
  useEffect(() => {
    closedRef.current = false;
    return () => {
      closedRef.current = true;
    };
  }, []);
  const existingImages = review.images.filter(
    (image) => !deletedIds.includes(image.id),
  );
  const imageCount = existingImages.length + newImages.length;

  const close = () => {
    if (savingRef.current) return;
    closedRef.current = true;
    onClose();
  };

  const addImage = async () => {
    if (
      pickingRef.current ||
      savingRef.current ||
      imageCount >= review.max_images
    )
      return;
    pickingRef.current = true;
    setPicking(true);
    try {
      const image = await pickImage();
      if (image && !closedRef.current) {
        const picked: ReviewPickedImage = {
          uri: image.uri,
          name: image.name ?? "review.jpg",
          type: image.type ?? "image/jpeg",
        };
        if (!["image/jpeg", "image/png", "image/webp"].includes(picked.type)) {
          setError("Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.");
        } else {
          setNewImages((current) => [...current, picked]);
          setError("");
        }
      }
    } catch {
      if (!closedRef.current) setError("Không thể chọn ảnh. Vui lòng thử lại.");
    } finally {
      pickingRef.current = false;
      if (!closedRef.current) setPicking(false);
    }
  };

  const save = async () => {
    if (savingRef.current || pickingRef.current) return;
    if (!canEditReview(review)) {
      setError(
        "Đã hết thời hạn chỉnh sửa đánh giá (30 ngày kể từ lần gửi đầu tiên).",
      );
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("rating", String(rating));
      data.append("comment", comment.trim());
      deletedIds.forEach((id) => data.append("delete_image_ids", String(id)));
      for (const image of newImages) {
        if (Platform.OS === "web") {
          const blob = await (await fetch(image.uri)).blob();
          data.append("images", blob, image.name);
        } else {
          data.append("images", image as unknown as Blob);
        }
      }
      await updateReview({ id: review.id, data }).unwrap();
      showSuccessToast(
        "Đã cập nhật đánh giá",
        "Cảm ơn bạn đã chia sẻ trải nghiệm.",
      );
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Không thể cập nhật đánh giá. Vui lòng thử lại.",
        ),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return {
    rating,
    setRating,
    comment,
    setComment,
    error,
    isSaving,
    isPicking,
    existingImages,
    newImages,
    imageCount,
    addImage,
    save,
    close,
    removeExisting: (id: number) =>
      setDeletedIds((current) => [...current, id]),
    removeNew: (index: number) =>
      setNewImages((current) => current.filter((_, i) => i !== index)),
  };
}
