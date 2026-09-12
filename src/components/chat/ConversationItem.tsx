import { Conversation } from "@/types/Message";
import { formatRelativeTime } from "@/utils/formatTime";
import { Feather } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (id: number) => void;
}

export default function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  const hasUnread = conversation.unread_count > 0;

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      <View className="relative mr-3">
        <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
          {conversation.worker_avatar ? (
            <Image
              source={{ uri: conversation.worker_avatar }}
              style={{ width: 56, height: 56 }}
            />
          ) : (
            <Feather name="user" size={24} color="#9CA3AF" />
          )}
        </View>
        {conversation.is_worker_online && (
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="font-bold text-gray-900 text-base flex-1 mr-2"
            numberOfLines={1}
          >
            {conversation.worker_name}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatRelativeTime(conversation.last_message_at)}
          </Text>
        </View>

        {conversation.booking_code && (
          <View className="self-start bg-emerald-50 rounded-full px-2 py-0.5 mb-1">
            <Text className="text-emerald-700 text-xs font-medium">
              {conversation.booking_code}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${
              hasUnread ? "text-gray-800 font-medium" : "text-gray-500"
            }`}
            numberOfLines={1}
          >
            {conversation.last_message}
          </Text>
          {hasUnread && (
            <View className="bg-emerald-600 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
