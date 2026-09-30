import {
    useGetFavoriteWorkersQuery,
    useRemoveFavoriteWorkerMutation,
} from "@/features/favorite-worker/api/favoriteWorkerApi";
import type { FavoriteWorker } from "@/features/favorite-worker/types/FavoriteWorker";
import { useAppSelector } from "@/store/hooks";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useEffect, useState } from "react";

const PAGE_SIZE = 20;

export function useFavoriteWorkers() {
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const [page, setPage] = useState(1);
  const [workers, setWorkers] = useState<FavoriteWorker[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetFavoriteWorkersQuery(
      { page, page_size: PAGE_SIZE },
      { skip: !isAuthenticated },
    );
  const [removeFavorite] = useRemoveFavoriteWorkerMutation();

  useEffect(() => {
    if (!data) return;
    setWorkers((current) => {
      const merged = page === 1 ? [] : [...current];
      for (const worker of data.results) {
        const index = merged.findIndex(
          (item) => item.worker_id === worker.worker_id,
        );
        if (index >= 0) merged[index] = worker;
        else merged.push(worker);
      }
      return merged;
    });
  }, [data, page]);

  const refresh = () => {
    setWorkers([]);
    if (page === 1) void refetch();
    else setPage(1);
  };

  const loadMore = () => {
    if (data?.has_next && !isFetching) setPage((value) => value + 1);
  };

  const remove = async (worker: FavoriteWorker) => {
    setRemovingId(worker.worker_id);
    try {
      await removeFavorite(worker.worker_id).unwrap();
      setWorkers((current) =>
        current.filter((item) => item.worker_id !== worker.worker_id),
      );
      showSuccessToast(
        "Đã bỏ yêu thích",
        `${worker.last_name} ${worker.first_name}`.trim(),
      );
    } catch (error: any) {
      showErrorToast(
        "Không thể bỏ yêu thích",
        error?.data?.message ?? "Vui lòng thử lại sau.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return {
    isAuthenticated,
    workers,
    count: data?.count ?? workers.length,
    removingId,
    isInitialLoading: isLoading && page === 1,
    hasError: isError && workers.length === 0,
    refreshing: isFetching && page === 1,
    isLoadingMore: isFetching && page > 1,
    refresh,
    loadMore,
    retry: refetch,
    remove,
  };
}
