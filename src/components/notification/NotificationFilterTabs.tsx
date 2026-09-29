import { SHADOWS } from "@/constants/theme";
import { NotificationType } from "@/types/Notification";
import { NOTIFICATION_FILTER_OPTIONS } from "@/utils/notificationMeta";
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
      {NOTIFICATION_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value as NotificationFilter)}
            activeOpacity={0.8}
            className={`h-10 px-5 rounded-full border items-center justify-center ${
              isActive ? "bg-primary border-primary" : "bg-surface border-line"
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
