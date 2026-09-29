import { useGetBookingsQuery } from "@/services/bookingApi";
import { useAppSelector } from "@/store/hooks";
import type { BookingListItem, BookingStatus } from "@/types/Booking";
import { useEffect, useState } from "react";

export type BookingTab = BookingStatus | "ALL";

const dedupe = (list: BookingListItem[]) => {
  const seen = new Set<number>();
  return list.filter((b) => (seen.has(b.id) ? false : (seen.add(b.id), true)));
};

export function useBookingList() {
  const isAuthenticated = !!useAppSelector((s) => s.auth.user);
  const [activeTab, setActiveTab] = useState<BookingTab>("ALL");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState<BookingListItem[]>([]); // dữ liệu từ trang 2 trở đi
  const [refreshing, setRefreshing] = useState(false);

  // currentData: chỉ có dữ liệu đúng tab/trang hiện tại, không giữ data tab cũ
  const { currentData, isFetching, isError, refetch } = useGetBookingsQuery(
    { ...(activeTab === "ALL" ? {} : { status: activeTab }), page },
    { skip: !isAuthenticated },
  );

  useEffect(() => {
    if (page > 1 && currentData) {
      setMore((prev) => dedupe([...prev, ...currentData.results]));
    }
  }, [currentData, page]);

  const items =
    page === 1 ? (currentData?.results ?? []) : dedupe([...(more ?? [])]);

  const isInitialLoading = page === 1 && !currentData && isFetching;
  const isLoadingMore = page > 1 && isFetching;

  const changeTab = (tab: BookingTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setMore([]);
  };

  const loadMore = () => {
    if (currentData?.has_next && !isFetching) {
      if (page === 1) setMore(currentData.results);
      setPage((p) => p + 1);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setPage(1);
    setMore([]);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    isAuthenticated,
    activeTab,
    items,
    isError,
    isInitialLoading,
    isLoadingMore,
    refreshing,
    changeTab,
    loadMore,
    refresh,
  };
}
