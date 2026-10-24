import { useTranslation } from "react-i18next";

import { Avatar } from "@/components/ui";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
      <Text className="font-bold text-ink" style={{ fontSize: 24, lineHeight: 30 }}>
        {t("Tài khoản")}
      </Text>
      <View className="flex-row items-center" style={{ marginTop: 14 }}>
        <Avatar uri={avatar} size={48} />
        <View className="flex-1 ml-3">
          <Text className="font-bold text-ink" style={{ fontSize: 16, lineHeight: 22 }} numberOfLines={1}>
            {name}
          </Text>
          {subtitle ? (
            <Text className="text-ink-soft mt-0.5" style={{ fontSize: 12, lineHeight: 18 }} numberOfLines={isAuthenticated ? 1 : 2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
