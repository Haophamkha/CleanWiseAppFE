import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

interface TypingIndicatorProps {
  avatarUri?: string | null;
}

export default function TypingIndicator({ avatarUri }: TypingIndicatorProps) {
  return (
    <View className="flex-row items-end mb-3">
      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center overflow-hidden mr-2">
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: 32, height: 32 }}
          />
        ) : (
          <Feather name="user" size={16} color="#9CA3AF" />
        )}
      </View>
      <View
        className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        <Text className="text-gray-400 text-base tracking-widest leading-3">
          •••
        </Text>
      </View>
    </View>
  );
}
