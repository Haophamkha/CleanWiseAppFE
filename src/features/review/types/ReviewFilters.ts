export type ReviewFilters = {
  rating?: number;
  period: "all" | "30_days" | "3_months" | "custom";
  date_from?: string;
  date_to?: string;
  editable_only: boolean;
  ordering: "newest" | "oldest";
};

export type ReviewQuery = ReviewFilters & { search?: string };
