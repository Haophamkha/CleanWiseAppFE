export type ChatbotConversation = {
  id: number;
  title: string;
  status: "ACTIVE" | "CLOSED";
  created_at: string;
  updated_at: string;
};

type CardBase = { title: string; label: string };
export type ChatbotCard =
  | (CardBase & { type: "help"; action: "OPEN_HELP_ARTICLE"; article_id: number; version: number; effective_from: string })
  | (CardBase & { type: "service"; action: "OPEN_SERVICE"; service_id: number })
  | (CardBase & {
      type: "booking";
      action: "OPEN_BOOKING";
      booking_id: number;
      data?: {
        service_name: string;
        status_label: string;
        payment_status_label: string;
        total_amount: string | null;
      };
    })
  | (CardBase & {
      type: "schedule";
      action: "OPEN_SCHEDULE";
      schedule_id: number;
      booking_id: number;
      scheduled_start: string | null;
      status: string;
      status_label: string;
    });

export type ChatbotMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  text: string;
  cards: ChatbotCard[];
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  client_message_id: string | null;
  run_id: string | null;
  created_at: string;
};

export type HelpArticle = {
  id: number;
  slug: string;
  version: number;
  title: string;
  summary: string;
  sections: { heading: string; text: string }[];
  effective_from: string;
  source_document: string;
};

export type ChatbotRun = {
  id: string;
  status: "RUNNING" | "SUCCEEDED" | "FAILED";
  error_code: string;
  attempts: number;
  duration_ms: number;
  created_at: string;
  finished_at: string | null;
};

export type ChatbotRunDetail = {
  run: ChatbotRun;
  user_message: ChatbotMessage;
  assistant_message: ChatbotMessage | null;
};
export type ChatbotReply = ChatbotRunDetail & {
  conversation_id: number;
  replayed: boolean;
};
export type ChatbotPage<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
export type PendingChatbotMessage = {
  conversation_id: number;
  client_message_id: string;
  text: string;
  created_at: string;
};
export type DisplayChatbotMessage = Omit<ChatbotMessage, "id"> & {
  id: number | string;
};
