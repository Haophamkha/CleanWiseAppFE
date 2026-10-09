import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { ChatbotCard } from "../types/chatbot";

export function chatbotCardKey(card: ChatbotCard) {
  if (card.type === "help") return `help:${card.article_id}`;
  return card.type === "service"
    ? `service:${card.service_id}`
    : card.type === "booking"
      ? `booking:${card.booking_id}`
      : `schedule:${card.schedule_id}`;
}

export function ChatbotActionCard({
  card,
  onPress,
  loading,
}: {
  card: ChatbotCard;
  onPress: () => void;
  loading: boolean;
}) {
  const icon =
    card.type === "help"
      ? "book-open"
      : card.type === "service"
      ? "grid"
      : card.type === "booking"
        ? "package"
        : "calendar";
  const subtitle =
    card.type === "help"
      ? `Nguồn hướng dẫn · Phiên bản ${card.version}`
      : card.type === "booking"
      ? [card.data?.service_name, card.data?.status_label]
          .filter(Boolean)
          .join(" · ")
      : card.type === "schedule"
        ? card.status_label
        : "Dịch vụ CleanWise";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${card.label}: ${card.title}`}
      className="bg-primary-soft border border-primary-border rounded-2xl p-3 mt-2"
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center mr-2.5">
          <Feather name={icon} size={17} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-bold text-[13px]" numberOfLines={2}>
            {card.title}
          </Text>
          {!!subtitle && (
            <Text className="text-ink-soft text-xs mt-0.5" numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row items-center justify-end mt-2">
        <Text className="text-primary-dark text-xs font-bold mr-1.5">
          {card.label}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Feather name="arrow-right" size={14} color={COLORS.primaryDark} />
        )}
      </View>
    </TouchableOpacity>
  );
}
