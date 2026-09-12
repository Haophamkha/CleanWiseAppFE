import ChatBubble from "@/components/chat/ChatBubble";
import ChatInputBar from "@/components/chat/ChatInputBar";
import OrderInfoCard from "@/components/chat/OrderInfoCard";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { ChatBookingSummary, ChatMessage } from "@/types/Message";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// TODO: khi có BE, lấy CUSTOMER_ID từ store.auth.user?.id thay vì hard-code.
const CURRENT_CUSTOMER_ID = 101;
const MOCK_WORKER_ID = 55;

// TODO: thay bằng GET /api/chat/conversations/{id}/ khi BE sẵn sàng
const MOCK_WORKER = {
  name: "Nguyễn Thị Lan",
  avatar: null as string | null,
  isOnline: true,
};

const MOCK_BOOKING: ChatBookingSummary = {
  id: 128,
  booking_code: "CC-2026-00128",
  status: "IN_PROGRESS",
  service_name: "Dọn dẹp nhà theo ca",
  scheduled_start: "2026-09-11T10:00:00Z",
  scheduled_end: "2026-09-11T12:00:00Z",
};

// TODO: thay bằng GET /api/chat/conversations/{id}/messages/ khi BE sẵn sàng
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    conversation_id: 1,
    sender_id: MOCK_WORKER_ID,
    message: "Chào bạn, mình đã nhận đơn dọn dẹp lúc 10:00 nhé.",
    message_type: "TEXT",
    attachment: null,
    is_read: true,
    created_at: "2026-09-11T09:45:00Z",
  },
  {
    id: 2,
    conversation_id: 1,
    sender_id: MOCK_WORKER_ID,
    message:
      "Mình đang di chuyển, dự kiến khoảng 5 phút nữa mình sẽ tới nơi ạ. Bạn chuẩn bị mở cửa giúp mình nhé.",
    message_type: "TEXT",
    attachment: null,
    is_read: true,
    created_at: "2026-09-11T09:46:00Z",
  },
  {
    id: 3,
    conversation_id: 1,
    sender_id: CURRENT_CUSTOMER_ID,
    message: "Dạ vâng, cảm ơn chị.",
    message_type: "TEXT",
    attachment: null,
    is_read: true,
    created_at: "2026-09-11T09:47:00Z",
  },
  {
    id: 4,
    conversation_id: 1,
    sender_id: CURRENT_CUSTOMER_ID,
    message:
      "Khi nào tới sảnh chị nhắn em xuống đón nha, mã thang máy toà nhà nay bị lỗi.",
    message_type: "TEXT",
    attachment: null,
    is_read: false,
    created_at: "2026-09-11T09:48:00Z",
  },
];

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [isOtherTyping] = useState(true);

  const handleSend = (text: string) => {
    // TODO: gọi POST /api/chat/conversations/{id}/messages/ khi BE sẵn sàng
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        conversation_id: Number(id),
        sender_id: CURRENT_CUSTOMER_ID,
        message: text,
        message_type: "TEXT",
        attachment: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden mr-3">
          {MOCK_WORKER.avatar ? (
            <Image
              source={{ uri: MOCK_WORKER.avatar }}
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <Feather name="user" size={18} color="#9CA3AF" />
          )}
        </View>

        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-base">
            {MOCK_WORKER.name}
          </Text>
          <Text className="text-emerald-600 text-xs">
            {MOCK_WORKER.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
          </Text>
        </View>

        <TouchableOpacity className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center">
          <Feather name="phone" size={17} color="#047857" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <OrderInfoCard booking={MOCK_BOOKING} />

        <View className="px-5 pt-2">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isMine={message.sender_id === CURRENT_CUSTOMER_ID}
              workerAvatar={MOCK_WORKER.avatar}
            />
          ))}
          {isOtherTyping && <TypingIndicator avatarUri={MOCK_WORKER.avatar} />}
        </View>
      </ScrollView>

      <ChatInputBar onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}
