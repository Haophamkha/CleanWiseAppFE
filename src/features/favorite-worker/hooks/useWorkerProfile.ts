import { useLazyGetAssignmentConversationQuery } from "@/services/chatApi";
import {
    useAddFavoriteWorkerMutation,
    useGetWorkerProfileQuery,
    useRemoveFavoriteWorkerMutation,
} from "@/services/favoriteWorkerApi";
import type { BookingScheduleDetail } from "@/types/Booking";
import type { FavoriteWorker } from "@/types/FavoriteWorker";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

export type WorkerProfileData = (
  | NonNullable<BookingScheduleDetail["worker"]>
  | FavoriteWorker
) & {
  total_completed_jobs?: number;
  work_area?: string;
  skills?: string[];
};

export function useWorkerProfile() {
  const { id, data, assignmentId } = useLocalSearchParams<{
    id: string;
    data?: string;
    assignmentId?: string;
  }>();
  const workerId = Number(id);

  const routeWorker = useMemo(() => {
    try {
      return data ? (JSON.parse(data) as WorkerProfileData) : null;
    } catch {
      return null;
    }
  }, [data]);

  const {
    data: fetchedWorker,
    isLoading: loadingWorker,
    isError: workerError,
    refetch,
  } = useGetWorkerProfileQuery(workerId, {
    skip: !Number.isInteger(workerId) || workerId <= 0,
  });
  const [getChat, { isFetching: openingChat }] =
    useLazyGetAssignmentConversationQuery();
  const [addFavorite, { isLoading: addingFavorite }] =
    useAddFavoriteWorkerMutation();
  const [removeFavorite, { isLoading: removingFavorite }] =
    useRemoveFavoriteWorkerMutation();
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(
    null,
  );
  const [reconcilingFavorite, setReconcilingFavorite] = useState(false);

  const worker = (fetchedWorker ?? routeWorker) as WorkerProfileData | null;
  const liked = favoriteOverride ?? worker?.is_favorite ?? false;
  const updatingFavorite =
    addingFavorite || removingFavorite || reconcilingFavorite;

  useEffect(() => {
    setFavoriteOverride(null);
  }, [fetchedWorker?.is_favorite]);

  const openChat = async () => {
    const selectedAssignment = Number(assignmentId);
    if (!Number.isInteger(selectedAssignment) || selectedAssignment <= 0) {
      Alert.alert(
        "Chưa thể nhắn tin",
        "Hãy mở hồ sơ từ lịch đã được phân công.",
      );
      return;
    }
    try {
      const result = await getChat(selectedAssignment).unwrap();
      router.push({
        pathname: "/messages/[id]",
        params: {
          id: String(result.conversation.id),
          assignmentId: String(selectedAssignment),
        },
      });
    } catch {
      Alert.alert(
        "Không mở được trò chuyện",
        "Vui lòng kiểm tra lịch phân công và thử lại.",
      );
    }
  };

  const toggleFavorite = async () => {
    if (!Number.isInteger(workerId) || workerId <= 0 || updatingFavorite)
      return;

    const nextLiked = !liked;
    setFavoriteOverride(nextLiked);

    const showSuccess = () => {
      if (nextLiked) {
        showSuccessToast(
          "Đã thêm vào yêu thích",
          "Bạn có thể xem lại trong mục Tài khoản.",
        );
      } else {
        showSuccessToast("Đã bỏ yêu thích");
      }
    };

    // Phản hồi ngay trên giao diện; đồng bộ BE tiếp tục chạy nền.
    showSuccess();

    const reconcileFavoriteState = async () => {
      // DELETE/PUT có thể đã commit sau khi response phía app bị timeout.
      // Chờ ngắn và đọc lại vài lần để không báo lỗi giả vì race condition.
      const retryDelays = [250, 650, 1200];
      for (const delay of retryDelays) {
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
        try {
          const refreshedWorker = await refetch().unwrap();
          if (refreshedWorker.is_favorite === nextLiked) return true;
        } catch {
          // Tiếp tục lần đối soát kế tiếp nếu GET tạm thời cũng lỗi.
        }
      }
      return false;
    };

    try {
      if (nextLiked) {
        await addFavorite(workerId).unwrap();
      } else {
        await removeFavorite(workerId).unwrap();
      }
    } catch (error: any) {
      setReconcilingFavorite(true);
      try {
        if (await reconcileFavoriteState()) {
          setFavoriteOverride(nextLiked);
          return;
        }
      } finally {
        setReconcilingFavorite(false);
      }

      setFavoriteOverride(null);
      showErrorToast(
        "Không thể cập nhật",
        error?.data?.message ?? "Vui lòng kiểm tra kết nối và thử lại.",
      );
    }
  };

  // Dữ liệu hiển thị đã tính sẵn để UI chỉ việc render
  const fullName = worker
    ? `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim() ||
      "Nhân viên"
    : "";
  const rating = Number(worker?.average_rating ?? 0);
  const experienceYears = worker?.experience_years ?? 0;
  const completedJobs = worker?.total_completed_jobs ?? 0;
  const hasRating = completedJobs > 0 && rating > 0;

  return {
    worker,
    // chỉ hiện loading toàn màn khi chưa có dữ liệu từ route
    isLoading: loadingWorker && !routeWorker,
    isError: workerError,
    refetch,
    goBack: () => router.back(),

    fullName,
    rating,
    experienceYears,
    completedJobs,
    hasRating,

    liked,
    updatingFavorite,
    toggleFavorite,
    openingChat,
    openChat,
  };
}
