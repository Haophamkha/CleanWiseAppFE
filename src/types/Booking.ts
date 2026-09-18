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
};

export type BookingScheduleDetail = {
  id: number;
  sequence_no: number;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
  note: string | null;
};

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

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
