import ConversationItem from "@/components/chat/ConversationItem";
import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { useAppSelector } from "@/store/hooks";
import { Conversation } from "@/types/Message";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

// TODO: thay bằng GET /api/chat/conversations/ khi BE sẵn sàng.
// Field đặt tên khớp chat_conversations + join worker/booking để dễ map.
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    booking_id: 128,
    customer_id: 101,
    worker_id: 55,
    status: "ACTIVE",
    created_at: "2026-09-11T09:40:00Z",
    updated_at: "2026-09-11T09:48:00Z",
    worker_name: "Nguyễn Thị Lan",
    worker_avatar: null,
    is_worker_online: true,
    booking_code: "CC-2026-00128",
    last_message: "Chào chị, em đang trên đường...",
    last_message_at: "2026-09-11T09:48:00Z",
    unread_count: 1,
  },
];

export default function MessagesScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const handleOpenChat = (id: number) => {
    router.push(`/messages/${id}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity>
          <Feather name="menu" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-emerald-700">Tin nhắn</Text>
        {isAuthenticated ? (
          <NotificationBellButton />
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {isAuthenticated ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ConversationItem conversation={item} onPress={handleOpenChat} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-24">
              <Feather name="message-circle" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3">Chưa có tin nhắn nào</Text>
            </View>
          }
        />
      ) : (
        <View className="flex-1 px-5">
          <RequireLoginNotice message="Đăng nhập để xem và nhắn tin với nhân viên phụ trách đơn hàng của bạn" />
        </View>
      )}
    </View>
  );
}
