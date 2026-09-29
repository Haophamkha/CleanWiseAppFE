import type { ChatMessage } from "@/types/chat";

export type UiChatMessage = ChatMessage & {
  localStatus?: "sending" | "failed";
};

// Gộp tin nhắn mới vào danh sách, thay tin tạm (đang gửi/lỗi) bằng tin đã lưu
export function mergeMessages(
  current: UiChatMessage[],
  incoming: ChatMessage[],
): UiChatMessage[] {
  const next = [...current];
  for (const message of incoming) {
    const savedIndex = next.findIndex((item) => item.id === message.id);
    if (savedIndex >= 0) {
      next[savedIndex] = {
        ...message,
        is_read: message.is_read || next[savedIndex].is_read,
      };
      continue;
    }
    if (message.message_type === "TEXT") {
      const matchesLocal = (item: UiChatMessage) => {
        const elapsedMs =
          new Date(message.created_at).getTime() -
          new Date(item.created_at).getTime();
        return (
          item.sender_id === message.sender_id &&
          item.message === message.message &&
          elapsedMs >= -5000 &&
          elapsedMs < 120000
        );
      };
      let pendingIndex = next.findIndex(
        (item) => item.localStatus === "sending" && matchesLocal(item),
      );
      if (pendingIndex < 0) {
        pendingIndex = next.findIndex(
          (item) => item.localStatus === "failed" && matchesLocal(item),
        );
      }
      if (pendingIndex >= 0) next.splice(pendingIndex, 1);
    }
    next.push(message);
  }
  return next.sort((a, b) => a.id - b.id);
}

// Hôm nay: hiện giờ. Ngày khác: hiện dd/MM
export function formatConversationTime(iso: string) {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatFullDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
