import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import type { FeatherName } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useTranslation } from "react-i18next";

import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MenuItem = {
  icon: FeatherName;
  label: string;
  href?: string;
};

function getLocalizedAccountItems(): MenuItem[] {
  return [
    { icon: "user", label: t("Thông tin cá nhân"), href: ROUTES.EDIT_PROFILE },
    { icon: "map-pin", label: t("Địa chỉ của tôi"), href: ROUTES.ADDRESS },
    {
      icon: "credit-card",
      label: t("Ví / Thẻ thanh toán"),
      href: ROUTES.WALLET,
    },
    { icon: "tag", label: t("Khuyến mãi"), href: ROUTES.VOUCHERS },
    {
      icon: "heart",
      label: t("Nhân viên yêu thích"),
      href: ROUTES.FAVORITE_WORKERS,
    },
    {
      icon: "clock",
      label: t("Lịch sử thanh toán"),
      href: ROUTES.PAYMENT_HISTORY,
    },
    {
      icon: "message-square",
      label: t("Đánh giá và khiếu nại"),
      href: ROUTES.MY_REVIEWS,
    },
  ];
}

function getLocalizedSupportItems(): MenuItem[] {
  return [
    { icon: "book-open", label: t("Hướng dẫn sử dụng"), href: ROUTES.HELP },
    { icon: "settings", label: t("Cài đặt"), href: ROUTES.SETTINGS },
    { icon: "info", label: t("Về CleanWise"), href: ROUTES.ABOUT },
  ];
}

const renderItems = (items: MenuItem[]) =>
  items.map((item) => (
    <MenuListItem
      key={item.label}
      icon={item.icon}
      label={item.label}
      comingSoon={!item.href}
      onPress={item.href ? () => router.push(item.href as any) : undefined}
    />
  ));

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const p = useProfile();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ProfileHeader
          isAuthenticated={p.isAuthenticated}
          name={p.displayName}
          subtitle={p.subtitle}
          avatar={p.avatar}
        />

        <View className="px-5" style={{ paddingTop: 20 }}>
          {p.isAuthenticated ? (
            <MenuGroup title={t("Tài khoản")}>
              {renderItems(getLocalizedAccountItems())}
            </MenuGroup>
          ) : (
            <RequireLoginNotice
              message={t(
                "Đăng nhập để xem thông tin cá nhân, địa chỉ, đơn dịch vụ và ưu đãi của bạn",
              )}
            />
          )}

          <MenuGroup title={t("Hỗ trợ")}>
            {renderItems(getLocalizedSupportItems())}
          </MenuGroup>

          {p.isAuthenticated && (
            <TouchableOpacity
              accessibilityRole="button"
              className="flex-row items-center justify-center bg-danger-light"
              style={{ borderRadius: 999, minHeight: 50, padding: 12 }}
              onPress={p.logout}
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={18} color={COLORS.danger} />
              <Text
                className="text-danger font-semibold ml-2"
                style={{ fontSize: 15, lineHeight: 22 }}
              >
                {t("Đăng xuất")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
