import { ChatMessage } from "@/types/Message";
import { formatMessageTime } from "@/utils/formatTime";
import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

interface ChatBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  workerAvatar?: string | null;
}

export default function ChatBubble({
  message,
  isMine,
  workerAvatar,
}: ChatBubbleProps) {
  if (isMine) {
    return (
      <View className="items-end mb-3">
        <View className="max-w-[80%] bg-emerald-600 rounded-2xl rounded-tr-sm px-4 py-3">
          <Text className="text-white text-[15px] leading-5">
            {message.message}
          </Text>
        </View>
        <View className="flex-row items-center mt-1 mr-1">
          <Text className="text-gray-400 text-[11px] mr-1">
            {formatMessageTime(message.created_at)}
          </Text>
          <Feather
            name={message.is_read ? "check-circle" : "check"}
            size={12}
            color={message.is_read ? "#047857" : "#9CA3AF"}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-end mb-3">
      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center overflow-hidden mr-2">
        {workerAvatar ? (
          <Image
            source={{ uri: workerAvatar }}
            style={{ width: 32, height: 32 }}
          />
        ) : (
          <Feather name="user" size={16} color="#9CA3AF" />
        )}
      </View>

      <View className="max-w-[75%]">
        <View
          className="bg-white rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <Text className="text-gray-900 text-[15px] leading-5">
            {message.message}
          </Text>
        </View>
        <Text className="text-gray-400 text-[11px] mt-1 ml-1">
          {formatMessageTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}
