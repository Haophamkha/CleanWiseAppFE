import { COLORS } from "@/constants/theme";
import { useGetUnreadCountQuery } from "@/features/notification/api/notificationApi";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const UNREAD_COUNT_POLL_MS = 15000;

export function NotificationBellButton() {
  const user = useAppSelector((s) => s.auth.user);
  useGetUnreadCountQuery(undefined, { skip: !user });
  const unreadCount = useAppSelector((s) => s.notification.unreadCount);

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications" as any)}
      activeOpacity={0.7}
      className="relative"
    >
      <Feather name="bell" size={22} color={COLORS.ink} />
      {unreadCount > 0 && (
        <View className="absolute -top-1.5 -right-1.5 bg-danger rounded-full min-w-[16px] h-4 items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
