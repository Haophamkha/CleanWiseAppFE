import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { Avatar, GradientHeader } from "@/components/ui";
import { Text, View } from "react-native";

type Props = {
  isAuthenticated: boolean;
  name: string;
  subtitle?: string;
  avatar?: string | null;
};

export function ProfileHeader({
  isAuthenticated,
  name,
  subtitle,
  avatar,
}: Props) {
  return (
    <GradientHeader>
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-ink">Tài khoản</Text>
        {isAuthenticated ? (
          <View className="w-11 h-11 rounded-full bg-surface items-center justify-center">
            <NotificationBellButton />
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center mt-5">
        <View className="p-1 bg-surface rounded-full">
          <Avatar uri={avatar} size={72} />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-xl font-bold text-ink" numberOfLines={1}>
            {name}
          </Text>
          {subtitle ? (
            <Text className="text-sm text-ink-soft mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </GradientHeader>
  );
}
