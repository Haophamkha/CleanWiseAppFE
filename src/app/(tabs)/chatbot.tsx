// app/(tabs)/chatbot.tsx
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ChatbotScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Chatbot</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Feather name="cpu" size={40} color="#D1D5DB" />
        <Text className="text-gray-800 font-bold text-base mt-3">
          Chatbot đang được phát triển
        </Text>
        <Text className="text-gray-400 text-xs text-center mt-1">
          Tính năng trò chuyện với trợ lý ảo sẽ sớm ra mắt.
        </Text>
      </View>
    </View>
  );
}
