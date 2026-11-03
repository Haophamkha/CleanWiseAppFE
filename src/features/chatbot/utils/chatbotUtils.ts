import { translate as defaultTranslate } from "@/features/language/i18n";

import type { ChatbotMessage, PendingChatbotMessage } from "../types/chatbot";

export function mergeChatbotMessages(
  ...groups: ChatbotMessage[][]
): ChatbotMessage[] {
  const byId = new Map<number, ChatbotMessage>();
  groups.forEach((group) =>
    group.forEach((message) => byId.set(message.id, message)),
  );
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

type ApiError = {
  status?: number;
  data?: {
    errors?: { chatbot_error_code?: string; detail?: string };
    message?: string;
  };
  retryAfter?: number;
};
export function chatbotErrorCode(error: unknown): string | undefined {
  return (error as ApiError | undefined)?.data?.errors?.chatbot_error_code;
}

export function chatbotErrorMessage(error: unknown, translateText = defaultTranslate): string {
  const err = error as ApiError | undefined;
  const code = chatbotErrorCode(error);
  if (code === "CHATBOT_PROVIDER_BUSY")
    return translateText("Dịch vụ AI đang tạm thời quá tải. Bạn thử lại sau ít phút nhé; câu hỏi sẽ không bị gửi trùng.");
  if (code === "CHATBOT_MODEL_TIMEOUT")
    return translateText("Dịch vụ AI phản hồi quá lâu. Bạn có thể bấm Thử lại; câu hỏi sẽ không bị gửi trùng.");
  if (code === "CHATBOT_RATE_LIMITED")
    return translateText("Dịch vụ AI đã đạt giới hạn sử dụng. Vui lòng thử lại sau.");
  if (code === "CHATBOT_PROVIDER_CONFIG_ERROR")
    return translateText("Dịch vụ AI chưa được cấu hình hợp lệ. Vui lòng liên hệ hỗ trợ.");
  if (code === "CHATBOT_NOT_CONFIGURED")
    return translateText("Trợ lý đang tạm thời chưa sẵn sàng. Bạn có thể thử lại sau.");
  if (code === "CONVERSATION_BUSY")
    return translateText("Trợ lý đang xử lý câu hỏi trước. Vui lòng chờ một chút rồi thử lại.");
  if (code === "CONVERSATION_CLOSED")
    return translateText("Hội thoại này đã đóng. Hãy tạo cuộc trò chuyện mới.");
  if (code === "OUTDATED_RETRY" || code === "MESSAGE_ID_REUSED")
    return translateText("Hãy chọn sửa câu hỏi rồi gửi lại để tiếp tục.");
  if (err?.status === 429)
    return err.retryAfter
      ? translateText("Bạn gửi hơi nhanh. Vui lòng thử lại sau {{value0}} giây.", { value0: err.retryAfter })
      : translateText("Bạn gửi hơi nhanh. Vui lòng đợi một chút rồi thử lại.");
  if (err?.status === 404)
    return translateText("Hội thoại không còn khả dụng. Hãy tải lại hoặc tạo cuộc trò chuyện mới.");
  if (err?.status === 401 || err?.status === 403)
    return translateText("Phiên đăng nhập không còn khả dụng. Vui lòng đăng nhập lại.");
  return translateText("Chưa thể nhận câu trả lời. Hãy kiểm tra kết nối và thử lại; câu hỏi sẽ không bị gửi trùng.");
}

export function parsePendingMessage(
  value: string | null,
): PendingChatbotMessage | null {
  if (!value) return null;
  try {
    const item = JSON.parse(value);
    if (
      Number.isSafeInteger(item.conversation_id) &&
      item.conversation_id > 0 &&
      typeof item.text === "string" &&
      item.text.trim().length > 0 &&
      item.text.length <= 2000 &&
      typeof item.client_message_id === "string" &&
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
        item.client_message_id,
      ) &&
      typeof item.created_at === "string" &&
      Number.isFinite(Date.parse(item.created_at))
    )
      return item;
  } catch {
    /* An interrupted or old local draft can be ignored. */
  }
  return null;
}
