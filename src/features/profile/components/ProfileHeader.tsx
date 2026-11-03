import { useTranslation } from "react-i18next";

import { TabScreenHeader } from "@/components/common/TabScreenHeader";
import { Avatar } from "@/components/ui";
import { useAppTheme } from "@/features/theme/ThemeProvider";
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
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  return (
    <TabScreenHeader title={t("Tài khoản")}>
      <View
        className="flex-row items-center"
        style={{ marginTop: 18, marginBottom: 8 }}
      >
        <View
          style={[
            {
              padding: 4,
              borderRadius: 999,
              backgroundColor: COLORS.white,
            },
            SHADOWS.card,
          ]}
        >
          <Avatar uri={avatar} size={72} />
        </View>
        <View className="flex-1 ml-4">
          <Text
            className="font-extrabold text-ink"
            style={{ fontSize: 22, lineHeight: 28 }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {subtitle ? (
            <Text
              className="text-ink-soft"
              style={{ fontSize: 14, lineHeight: 20, marginTop: 2 }}
              numberOfLines={isAuthenticated ? 1 : 2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </TabScreenHeader>
  );
}
