import { COLORS, SHADOWS } from "@/constants/theme";
import { AppNotification } from "@/types/Notification";
import { formatNotificationTime } from "@/utils/formatTime";
import { getNotificationTypeMeta } from "@/utils/notificationMeta";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

export default function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const meta = getNotificationTypeMeta(notification.type);
  const isUnread = !notification.is_read;

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      activeOpacity={0.75}
      className={`flex-row rounded-2xl border p-4 mb-3 ${
        isUnread
          ? "bg-primary-soft border-primary-border"
          : "bg-surface border-line"
      }`}
      style={SHADOWS.card}
    >
      <View
        className="items-center justify-center mr-3 rounded-2xl"
        style={{
          width: 56,
          height: 56,
          backgroundColor: meta.iconBgColor,
          opacity: isUnread ? 1 : 0.85,
        }}
      >
        <MaterialCommunityIcons
          name={meta.iconName as any}
          size={28}
          color={meta.iconColor}
        />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-[11px] font-bold uppercase tracking-wide"
            style={{ color: meta.iconColor }}
          >
            {meta.label}
          </Text>
          <Text className="text-[11px] text-ink-muted">
            {formatNotificationTime(notification.created_at)}
          </Text>
        </View>

        <View className="flex-row items-start">
          <Text
            className={`flex-1 text-[15px] ${
              isUnread ? "font-bold text-ink" : "font-semibold text-ink-soft"
            }`}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          {isUnread && (
            <View className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 ml-2" />
          )}
        </View>

        <Text
          className="text-ink-soft text-sm leading-5 mt-1"
          numberOfLines={2}
        >
          {notification.message}
        </Text>

        {notification.related_booking ? (
          <View className="flex-row items-center mt-2">
            <Text className="text-xs font-semibold text-primary">
              Xem đơn hàng
            </Text>
            <Feather name="chevron-right" size={14} color={COLORS.primary} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
