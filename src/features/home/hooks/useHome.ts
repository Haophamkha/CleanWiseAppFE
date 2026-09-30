import { useGetBookingsQuery } from "@/features/booking/api/bookingApi";
import { useGetServicesQuery } from "@/features/service/api/serviceApi";
import { useGetPublicVouchersQuery } from "@/features/voucher/api/voucherApi";
import { useAppSelector } from "@/store/hooks";
import { useCallback, useMemo, useState } from "react";

const ACTIVE_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS"];

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export function useHome() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const servicesQ = useGetServicesQuery();
  // Bỏ `skip` nếu endpoint voucher công khai cho phép khách chưa đăng nhập
  const vouchersQ = useGetPublicVouchersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const bookingsQ = useGetBookingsQuery(
    { page_size: 10 },
    { skip: !isAuthenticated, refetchOnMountOrArgChange: 30 },
  );

  const services = useMemo(() => {
    const list = servicesQ.data ?? [];
    const q = normalize(query.trim());
    return q ? list.filter((s) => normalize(s.name).includes(q)) : list;
  }, [servicesQ.data, query]);

  const vouchers = useMemo(
    () =>
      (vouchersQ.data ?? [])
        .filter((v) => v.lifecycle_status === "ACTIVE")
        .slice(0, 8),
    [vouchersQ.data],
  );

  const activeBookings = useMemo(
    () =>
      (bookingsQ.data?.results ?? [])
        .filter((b) => ACTIVE_STATUSES.includes(b.status))
        .slice(0, 2),
    [bookingsQ.data],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        servicesQ.refetch(),
        ...(isAuthenticated ? [vouchersQ.refetch(), bookingsQ.refetch()] : []),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, servicesQ, vouchersQ, bookingsQ]);

  // Họ và tên đầy đủ (họ trước, tên sau); không có thì rơi về username
  const fullName = [user?.last_name, user?.first_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    isAuthenticated,
    displayName: fullName || user?.username || "bạn",
    query,
    setQuery,
    isSearching: query.trim().length > 0,
    services,
    servicesLoading: servicesQ.isLoading,
    servicesError: servicesQ.isError,
    retryServices: servicesQ.refetch,
    vouchers,
    activeBookings,
    refreshing,
    onRefresh,
  };
}
