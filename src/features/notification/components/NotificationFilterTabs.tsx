import { useTranslation } from "react-i18next";
import { SHADOWS } from "@/constants/theme";
import { NotificationType } from "@/features/notification/types/Notification";
import { getLocalizedNotificationFilterOptions } from "@/features/notification/utils/notificationMeta";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export type NotificationFilter = "ALL" | NotificationType;

interface NotificationFilterTabsProps {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
}

export default function NotificationFilterTabs({
  value,
  onChange,
}: NotificationFilterTabsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        alignItems: "center",
      }}
    >
      {getLocalizedNotificationFilterOptions().map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value as NotificationFilter)}
            activeOpacity={0.8}
            className={`h-10 px-5 rounded-full border items-center justify-center ${
              isActive ? "bg-primary-fill border-primary" : "bg-surface border-line"
            }`}
            style={isActive ? SHADOWS.float : undefined}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-white" : "text-ink-soft"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
