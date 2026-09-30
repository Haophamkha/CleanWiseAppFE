import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { Avatar } from "@/components/ui";
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
    <TabScreenHeader title="Tài khoản">
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
    </TabScreenHeader>
  );
}
