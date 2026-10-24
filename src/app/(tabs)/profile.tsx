import { useTranslation } from "react-i18next";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import type { FeatherName } from "@/components/ui";
import { ROUTES } from "@/config/constants";

import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_CONTENT_HEIGHT = 96;

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
      icon: "heart",
      label: t("Nhân viên yêu thích"),
      href: ROUTES.FAVORITE_WORKERS,
    },
    { icon: "clock", label: t("Lịch sử thanh toán"), href: ROUTES.PAYMENT_HISTORY },
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
      compact
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
        contentContainerStyle={{
          paddingBottom: TAB_BAR_CONTENT_HEIGHT + insets.bottom + 16,
        }}
      >
        <ProfileHeader
          isAuthenticated={p.isAuthenticated}
          name={p.displayName}
          subtitle={p.subtitle}
          avatar={p.avatar}
        />

        <View className="px-5" style={{ paddingTop: 16 }}>
          {p.isAuthenticated ? (
            <>
              <View className="flex-row" style={{ gap: 10, marginBottom: 14 }}>
                {[
                  { icon: "credit-card", label: t("Ví / Thẻ thanh toán"), href: ROUTES.WALLET },
                  { icon: "tag", label: t("Khuyến mãi"), href: ROUTES.VOUCHERS },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.href}
                    accessibilityRole="button"
                    className="flex-1 bg-surface border border-line"
                    style={{ borderRadius: 18, padding: 12, minHeight: 84 }}
                    activeOpacity={0.7}
                    onPress={() => router.push(item.href as any)}
                  >
                    <Feather name={item.icon as FeatherName} size={20} color={COLORS.primary} />
                    <Text className="text-ink font-semibold" style={{ fontSize: 13, lineHeight: 19, marginTop: 8 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <MenuGroup compact title={t("Tài khoản")}>
                {renderItems(getLocalizedAccountItems())}
              </MenuGroup>
            </>
          ) : (
            <RequireLoginNotice message={t("Đăng nhập để xem thông tin cá nhân, địa chỉ, đơn hàng và ưu đãi của bạn")} />
          )}

          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
            {t("Hỗ trợ")}
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {getLocalizedSupportItems().map((item) => (
              <TouchableOpacity
                key={item.href}
                accessibilityRole="button"
                className="flex-1 bg-surface items-center justify-center"
                style={{ borderRadius: 12, minHeight: 70, paddingHorizontal: 4, paddingVertical: 10 }}
                activeOpacity={0.7}
                onPress={() => router.push(item.href as any)}
              >
                <Feather name={item.icon} size={18} color={item.href === ROUTES.SETTINGS ? COLORS.primary : COLORS.inkSoft} />
                <Text
                  className="text-center"
                  style={{ color: item.href === ROUTES.SETTINGS ? COLORS.primary : COLORS.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 7 }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {p.isAuthenticated && (
            <TouchableOpacity
              accessibilityRole="button"
              className="flex-row items-center justify-center bg-danger-light"
              style={{ borderRadius: 999, minHeight: 46, padding: 12, marginTop: 16 }}
              onPress={p.logout}
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={16} color={COLORS.danger} />
              <Text className="text-danger font-semibold ml-2" style={{ fontSize: 13, lineHeight: 20 }}>
                {t("Đăng xuất")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
