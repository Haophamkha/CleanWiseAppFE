import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useChatbotReveal } from "../hooks/useChatbotReveal";
import type { ChatbotCard, DisplayChatbotMessage } from "../types/chatbot";
import { formatChatbotText } from "../utils/formatChatbotText";
import { ChatbotActionCard, chatbotCardKey } from "./ChatbotActionCard";

export function ChatbotMessageBubble({
  message,
  onOpenCard,
  opening,
  animate = false,
  onRevealComplete,
}: {
  message: DisplayChatbotMessage;
  onOpenCard: (card: ChatbotCard) => void;
  opening: string | null;
  animate?: boolean;
  onRevealComplete?: () => void;
}) {
  const mine = message.role === "user";
  const revealed = useChatbotReveal(mine ? message.text : formatChatbotText(message.text), message.cards.length, animate && !mine, onRevealComplete);
  const cardTypes = new Set(message.cards.map((card) => card.type));
  const singleCard = message.cards.length === 1;
  const cardIntroduction =
    cardTypes.size === 1 && cardTypes.has("help")
      ? "Nguồn hướng dẫn tham khảo:"
      : cardTypes.size !== 1
      ? "Bạn có thể xem chi tiết các thông tin vừa tra cứu bên dưới:"
      : cardTypes.has("booking")
        ? singleCard
          ? "Bạn có thể xem chi tiết đơn hàng này bên dưới:"
          : "Dưới đây là các đơn hàng gần đây của bạn:"
        : cardTypes.has("schedule")
          ? singleCard
            ? "Bạn có thể xem chi tiết buổi dịch vụ này bên dưới:"
            : "Dưới đây là các buổi dịch vụ vừa tra cứu của bạn:"
          : singleCard
            ? "Bạn có thể xem chi tiết dịch vụ này bên dưới:"
            : "Dưới đây là các dịch vụ vừa tra cứu:";
  const time = new Date(message.created_at).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View
      className={`px-4 mb-4 flex-row ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine && (
        <View className="w-8 h-8 rounded-xl bg-primary-light items-center justify-center mr-2 mt-1">
          <MaterialCommunityIcons
            name="robot-happy-outline"
            size={21}
            color={COLORS.primaryDark}
          />
        </View>
      )}
      <View style={{ maxWidth: mine ? "86%" : "88%", flexShrink: 1 }}>
        {!mine && (
          <Text className="text-primary-dark font-bold text-[11px] mb-1.5 ml-1">
            Trợ lý CleanWise
          </Text>
        )}
        <View
          className={`px-4 py-3 rounded-3xl ${mine ? "bg-primary rounded-tr-md" : "bg-surface border border-line rounded-tl-md"}`}
        >
          <Text
            selectable
            className={`text-[15px] leading-6 ${mine ? "text-white" : "text-ink"}`}
          >
            {revealed.text || "\u200b"}
          </Text>
          {!mine && revealed.cardCount > 0 && (
            <Text className="text-ink text-[15px] leading-6 mt-3">
              {cardIntroduction}
            </Text>
          )}
          {!mine &&
            message.cards.slice(0, revealed.cardCount).map((card) => (
              <ChatbotActionCard
                key={chatbotCardKey(card)}
                card={card}
                loading={opening === chatbotCardKey(card)}
                onPress={() => onOpenCard(card)}
              />
            ))}
        </View>
        <View
          className={`flex-row items-center mt-1.5 px-1 ${mine ? "justify-end" : "justify-start"}`}
        >
          <Text className="text-ink-muted text-[10px]">{time}</Text>
          {mine && (
            <>
              <Feather
                name={
                  message.status === "FAILED"
                    ? "alert-circle"
                    : message.status === "PROCESSING"
                      ? "clock"
                      : "check"
                }
                size={11}
                color={
                  message.status === "FAILED" ? COLORS.danger : COLORS.inkMuted
                }
                style={{ marginLeft: 5 }}
              />
              {message.status !== "COMPLETED" && (
                <Text
                  className={`text-[10px] ml-1 ${message.status === "FAILED" ? "text-danger" : "text-ink-muted"}`}
                >
                  {message.status === "FAILED"
                    ? "Chưa có câu trả lời"
                    : "Đang xử lý"}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}
