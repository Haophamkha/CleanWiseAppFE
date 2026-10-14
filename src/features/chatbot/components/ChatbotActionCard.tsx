import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { ChatbotCard } from "../types/chatbot";

type IconName = ComponentProps<typeof Feather>["name"];

export function chatbotCardKey(card: ChatbotCard) {
  switch (card.type) {
    case "help":
      return `help:${card.article_id}`;
    case "service":
      return `service:${card.service_id}`;
    case "booking":
      return `booking:${card.booking_id}`;
    case "schedule":
      return `schedule:${card.schedule_id}`;
    case "address_map":
      return "address_map";
  }
}

function cardIcon(card: ChatbotCard): IconName {
  switch (card.type) {
    case "help":
      return "book-open";
    case "service":
      return "grid";
    case "booking":
      return "package";
    case "address_map":
      return "map-pin";
    default:
      return "calendar";
  }
}

function cardSubtitle(card: ChatbotCard): string {
  switch (card.type) {
    case "help":
      return `Nguồn hướng dẫn · Phiên bản ${card.version}`;
    case "booking":
      return [card.data?.service_name, card.data?.status_label]
        .filter(Boolean)
        .join(" · ");
    case "schedule":
      return card.status_label;
    case "address_map":
      return "Chọn vị trí rồi lưu, tôi sẽ tiếp tục giúp bạn";
    default:
      return "Dịch vụ CleanWise";
  }
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
  const icon = cardIcon(card);
  const subtitle = cardSubtitle(card);
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
