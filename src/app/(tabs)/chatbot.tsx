import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ChatbotScreen() {
  return (
    <View className="flex-1 bg-canvas">
      <TabScreenHeader title="Chatbot" />

      <View className="flex-1 items-center justify-center px-6">
        <Feather name="cpu" size={40} color={COLORS.inkMuted} />
        <Text className="text-ink font-bold text-base mt-3">
          Chatbot đang được phát triển
        </Text>
        <Text className="text-ink-muted text-xs text-center mt-1">
          Tính năng trò chuyện với trợ lý ảo sẽ sớm ra mắt.
        </Text>
      </View>
    </View>
  );
}
