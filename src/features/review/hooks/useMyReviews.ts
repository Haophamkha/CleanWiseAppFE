import { useGetMyReviewsQuery } from "@/features/review/api/reviewApi";
import type { Review } from "@/features/review/types/Review";
import type { ReviewFilters } from "@/features/review/types/ReviewFilters";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import {
  DEFAULT_REVIEW_FILTERS,
  reviewFilterLabels,
} from "@/features/review/utils/reviewFilters";

export function useMyReviews() {
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_REVIEW_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);
  const query = useGetMyReviewsQuery(
    { ...filters, search: debouncedSearch },
    {
      skip: !isAuthenticated,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  return {
    isAuthenticated,
    reviews: isAuthenticated ? (query.currentData ?? []) : [],
    isLoading: query.isLoading,
    isError: query.isError,
    refreshing: query.isFetching,
    refresh: query.refetch,
    editingReview,
    edit: setEditingReview,
    closeEditor: () => setEditingReview(null),
    search,
    setSearch,
    filters,
    filterOpen,
    openFilters: () => setFilterOpen(true),
    closeFilters: () => setFilterOpen(false),
    applyFilters: (next: ReviewFilters) => {
      setFilters(next);
      setFilterOpen(false);
    },
    filterLabels: reviewFilterLabels(filters),
    hasFilters: !!search.trim() || reviewFilterLabels(filters).length > 0,
    clearFilters: () => {
      setSearch("");
      setDebouncedSearch("");
      setFilters(DEFAULT_REVIEW_FILTERS);
    },
  };
}
