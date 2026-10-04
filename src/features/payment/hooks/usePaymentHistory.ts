import {
  useGetPaymentHistoryQuery,
  type PaymentHistoryItem,
  type PaymentHistorySource,
  type PaymentHistoryStatusFilter,
} from "@/features/payment/api/paymentHistoryApi";
import { useRefreshControl } from "@/hooks/useRefreshControl";
import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 20;

export type PaymentHistoryTotals = {
  paid: number;
  refunded: number;
  count: number;
};

/**
 * Gom các trang lại thành 1 danh sách cuộn vô hạn.
 * Component dùng hook này nên được gắn `key={source}` để đổi bộ lọc là reset sạch state.
 */
export function usePaymentHistory(
  source: PaymentHistorySource,
  status: PaymentHistoryStatusFilter,
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [totals, setTotals] = useState<PaymentHistoryTotals | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { currentData, isFetching, isError, refetch } =
    useGetPaymentHistoryQuery(
      { source, status, page, page_size: PAGE_SIZE },
      { refetchOnMountOrArgChange: true },
    );

  useEffect(() => {
    if (!currentData) return;
    setItems((prev) => {
      if (currentData.page === 1) return currentData.results;
      const seen = new Set(prev.map((i) => i.id));
      return [...prev, ...currentData.results.filter((i) => !seen.has(i.id))];
    });
    if (currentData.page === 1) {
      setTotals({
        paid: Number(currentData.summary.paid_total),
        refunded: Number(currentData.summary.refunded_total),
        count: currentData.count,
      });
    }
    setLoaded(true);
  }, [currentData]);

  const refresh = useCallback(async () => {
    if (page !== 1) {
      setPage(1); // đổi tham số sẽ tự tải lại trang đầu
      return;
    }
    await refetch();
  }, [page, refetch]);

  const { refreshing, onRefresh } = useRefreshControl(refresh);

  const loadMore = useCallback(() => {
    if (isFetching || !currentData?.has_next || currentData.page !== page) {
      return;
    }
    setPage((p) => p + 1);
  }, [isFetching, currentData, page]);

  return {
    items,
    totals,
    isInitialLoading: !loaded && !isError,
    isLoadingMore: isFetching && page > 1,
    isError: isError && items.length === 0,
    refreshing,
    onRefresh,
    loadMore,
    retry: refetch,
  };
}
