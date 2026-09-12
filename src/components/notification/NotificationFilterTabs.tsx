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
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      className="mb-4 flex-grow-0"
    >
      {NOTIFICATION_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value as NotificationFilter)}
            activeOpacity={0.8}
            className={`px-4 py-2 rounded-full border ${
              isActive
                ? "bg-emerald-600 border-emerald-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-white" : "text-gray-600"
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
