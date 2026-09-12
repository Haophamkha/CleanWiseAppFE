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
  const iconBgClass = isUnread ? "bg-emerald-50" : "bg-gray-100";
  const iconColor = isUnread ? "#047857" : "#6B7280";

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      className={`flex-row bg-white rounded-2xl p-4 mb-3 ${
        isUnread ? "border-l-4 border-emerald-600" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View
        className={`w-11 h-11 rounded-full items-center justify-center mr-3 ${iconBgClass}`}
      >
        {meta.iconLibrary === "material-community" ? (
          <MaterialCommunityIcons
            name={meta.iconName as any}
            size={20}
            color={iconColor}
          />
        ) : (
          <Feather name={meta.iconName as any} size={18} color={iconColor} />
        )}
      </View>

      <View className="flex-1">
        <Text
          className={`text-gray-900 text-[15px] mb-1 ${
            isUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {notification.title}
        </Text>
        <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-gray-400 text-xs mt-2 text-right">
          {formatNotificationTime(notification.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
