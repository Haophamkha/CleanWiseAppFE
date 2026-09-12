import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface ChatInputBarProps {
  onSend: (text: string) => void;
}

export default function ChatInputBar({ onSend }: ChatInputBarProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View className="flex-row items-end px-4 py-3 border-t border-gray-100 bg-white">
      <TouchableOpacity className="mr-2 mb-2">
        <Feather name="plus-circle" size={24} color="#6B7280" />
      </TouchableOpacity>
      <TouchableOpacity className="mr-2 mb-2">
        <Feather name="image" size={22} color="#6B7280" />
      </TouchableOpacity>

      <TextInput
        className="flex-1 bg-gray-50 rounded-3xl px-4 py-2.5 text-gray-900 mr-2 max-h-28"
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
      />

      <TouchableOpacity
        className={`w-10 h-10 rounded-full items-center justify-center ${
          text.trim() ? "bg-emerald-700" : "bg-gray-200"
        }`}
        onPress={handleSend}
        activeOpacity={0.8}
        disabled={!text.trim()}
      >
        <Feather name="send" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
