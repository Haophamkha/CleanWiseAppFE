export type PaymentMethod = "CASH" | "BANK_TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type BookingScheduleInput = {
  scheduled_start: string;
  scheduled_end: string;
};

export type CreateBookingRequest = {
  service_id: number;
  address_id: number;
  service_data: Record<string, any>;
  schedules: BookingScheduleInput[];
  note?: string;
  voucher_code?: string;
  payment_method: PaymentMethod;
};

export type BookingWorker = {
  worker_id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string | null;
  experience_years: number;
  average_rating: string;
  total_completed_jobs: number;
};

export type BookingScheduleDetail = {
    id: number;
    assignment_id: number | null;
    conversation_id: number | null;
  sequence_no: number;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
  note: string | null;
  worker: BookingWorker | null;
};

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type BookingPayment = {
  id: number;
  amount: string;
  method: PaymentMethod | string;
  method_display: string;
  status: PaymentStatus | string;
  status_display: string;
  transaction_code: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingListItem = {
  id: number;
  booking_code: string;
  service_name: string;
  status: BookingStatus;
  payment_status: string;
  subtotal_amount: string | null;
  discount_amount: string;
  total_amount: string | null;
  created_at: string;
};

export type BookingDetail = {
  id: number;
  booking_code: string;
  service_name: string;
  form_schema: Record<string, any>;
  pricing_config: Record<string, any>;
  service_data: Record<string, any>;
  address: number;
  note: string | null;
  status: BookingStatus;
  payment_status: string;
  payment: BookingPayment | null;
  price_breakdown: {
    subtotal_amount: string | null;
    discount_amount: string;
    total_amount: string | null;
    pricing_config_snapshot?: Record<string, any>;
  } | null;
  subtotal_amount: string | null;
  discount_amount: string;
  total_amount: string | null;
  schedules: BookingScheduleDetail[];
  created_at: string;
  updated_at: string;
};

export type BookingListResponse = {
  results: BookingListItem[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
};
