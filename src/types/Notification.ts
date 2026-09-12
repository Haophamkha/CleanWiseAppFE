// Khớp với bảng notifications trong DB.
export type NotificationType =
  | "BOOKING"
  | "PAYMENT"
  | "PROMOTION"
  | "REVIEW"
  | "SYSTEM";

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  related_booking_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
