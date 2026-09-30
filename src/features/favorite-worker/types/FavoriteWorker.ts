export type FavoriteWorker = {
  worker_id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string | null;
  experience_years: number;
  average_rating: string;
  total_completed_jobs: number;
  is_favorite: boolean;
  created_at?: string;
};

export type FavoriteWorkerListResponse = {
  results: FavoriteWorker[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
};
