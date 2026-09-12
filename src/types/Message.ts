// Field đặt tên khớp với bảng chat_conversations / chat_messages / bookings
// trong DB để khi nối API thật không phải đổi field.

export type ChatMessageType = "TEXT" | "IMAGE" | "SYSTEM";

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  message_type: ChatMessageType;
  attachment: string | null;
  is_read: boolean;
  created_at: string; // ISO timestamptz
}

export type ChatConversationStatus = "ACTIVE" | "CLOSED";

export interface Conversation {
  id: number;
  booking_id: number | null;
  customer_id: number;
  worker_id: number;
  status: ChatConversationStatus;
  created_at: string;
  updated_at: string;

  // Các field hiển thị - join từ users/worker_profiles/bookings/chat_messages
  // khi có BE, hiện để mock cho UI.
  worker_name: string;
  worker_avatar: string | null;
  is_worker_online: boolean;
  booking_code: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

// Rút gọn từ bảng bookings + services, hiển thị ở đầu màn hình chat
export interface ChatBookingSummary {
  id: number;
  booking_code: string;
  status: string;
  service_name: string;
  scheduled_start: string;
  scheduled_end: string;
}
