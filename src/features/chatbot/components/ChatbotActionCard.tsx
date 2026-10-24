import { translate as t } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/features/theme/ThemeProvider";

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
      return t("Nguồn hướng dẫn · Phiên bản {{value0}}", { value0: card.version });
    case "booking":
      return [card.data?.service_name, card.data?.status_label ? t(card.data.status_label) : undefined]
        .filter(Boolean)
        .join(" · ");
    case "schedule":
      return t(card.status_label);
    case "address_map":
      return t("Chọn vị trí rồi lưu, tôi sẽ tiếp tục giúp bạn");
    default:
      return t("Dịch vụ CleanWise");
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
  useTranslation();
  const { COLORS } = useAppTheme();

  const icon = cardIcon(card);
  const subtitle = cardSubtitle(card);
  const title = card.type === "address_map" ? t("Thêm địa chỉ trên bản đồ") : card.title;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${t(card.label)}: ${title}`}
      className="bg-primary-soft border border-primary-border rounded-2xl p-3 mt-2"
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 rounded-xl bg-primary-light items-center justify-center mr-2.5">
          <Feather name={icon} size={17} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="text-ink font-bold text-[13px]" numberOfLines={2}>
            {title}
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
          {t(card.label)}
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
