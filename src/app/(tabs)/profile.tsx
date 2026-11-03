import { translate as defaultTranslate } from "@/features/language/i18n";
import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import type { FeatherName } from "@/components/ui";
import { ROUTES } from "@/config/constants";

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

function getLocalizedAccountItems(translateText = defaultTranslate): MenuItem[] {
  return [
    { icon: "user", label: translateText("Thông tin cá nhân"), href: ROUTES.EDIT_PROFILE },
    { icon: "map-pin", label: translateText("Địa chỉ của tôi"), href: ROUTES.ADDRESS },
    {
      icon: "credit-card",
      label: translateText("Ví / Thẻ thanh toán"),
      href: ROUTES.WALLET,
    },
    { icon: "tag", label: translateText("Khuyến mãi"), href: ROUTES.VOUCHERS },
    {
      icon: "heart",
      label: translateText("Nhân viên yêu thích"),
      href: ROUTES.FAVORITE_WORKERS,
    },
    {
      icon: "clock",
      label: translateText("Lịch sử thanh toán"),
      href: ROUTES.PAYMENT_HISTORY,
    },
    {
      icon: "message-square",
      label: translateText("Đánh giá và khiếu nại"),
      href: ROUTES.MY_REVIEWS,
    },
  ];
}

function getLocalizedSupportItems(translateText = defaultTranslate): MenuItem[] {
  return [
    { icon: "book-open", label: translateText("Hướng dẫn sử dụng"), href: ROUTES.HELP },
    { icon: "settings", label: translateText("Cài đặt"), href: ROUTES.SETTINGS },
    { icon: "info", label: translateText("Về CleanWise"), href: ROUTES.ABOUT },
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
              {renderItems(getLocalizedAccountItems(t))}
            </MenuGroup>
          ) : (
            <RequireLoginNotice
              message={t(
                "Đăng nhập để xem thông tin cá nhân, địa chỉ, đơn dịch vụ và ưu đãi của bạn",
              )}
            />
          )}

          <MenuGroup title={t("Hỗ trợ")}>
            {renderItems(getLocalizedSupportItems(t))}
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
