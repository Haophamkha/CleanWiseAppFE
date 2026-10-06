import { useGetComplaintsQuery } from "@/features/complaint/api/complaintApi";
import type { ComplaintStatus } from "@/features/complaint/types/Complaint";
import { useAppSelector } from "@/store/hooks";
import { useMemo, useState } from "react";

export type ComplaintFilter = ComplaintStatus | "ALL";

export function useMyComplaints() {
  const isAuthenticated = !!useAppSelector((s) => s.auth.user);
  const [filter, setFilter] = useState<ComplaintFilter>("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const query = useGetComplaintsQuery(
    { page_size: 100 },
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const all = isAuthenticated ? (query.currentData?.results ?? []) : [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: all.length };
    all.forEach((i) => (c[i.status] = (c[i.status] ?? 0) + 1));
    return c;
  }, [all]);

  const items = filter === "ALL" ? all : all.filter((i) => i.status === filter);

  return {
    isAuthenticated,
    items,
    counts,
    filter,
    setFilter,
    isLoading: query.isLoading,
    isError: query.isError,
    refreshing: query.isFetching,
    refresh: query.refetch,
    selectedId,
    open: setSelectedId,
    close: () => setSelectedId(null),
  };
}
