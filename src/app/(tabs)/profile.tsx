import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import type { FeatherName } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { COLORS } from "@/constants/theme";
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
  href?: string; // không có href = chưa làm, hiện "Sắp có"
};

const ACCOUNT_ITEMS: MenuItem[] = [
  { icon: "user", label: "Thông tin cá nhân", href: ROUTES.EDIT_PROFILE },
  { icon: "map-pin", label: "Địa chỉ của tôi", href: ROUTES.ADDRESS },
  {
    icon: "heart",
    label: "Nhân viên yêu thích",
    href: ROUTES.FAVORITE_WORKERS,
  },
  { icon: "credit-card", label: "Ví / Thẻ thanh toán", href: ROUTES.WALLET },
  { icon: "clock", label: "Lịch sử thanh toán" },
  { icon: "tag", label: "Khuyến mãi", href: ROUTES.VOUCHERS },
  { icon: "star", label: "Đánh giá của tôi" },
];

const SUPPORT_ITEMS: MenuItem[] = [
  { icon: "settings", label: "Cài đặt", href: ROUTES.SETTINGS },
  { icon: "info", label: "Về CleanWise", href: ROUTES.ABOUT },
];

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

        <View className="px-5 pt-5">
          {p.isAuthenticated ? (
            <MenuGroup title="Tài khoản">
              {renderItems(ACCOUNT_ITEMS)}
            </MenuGroup>
          ) : (
            <RequireLoginNotice message="Đăng nhập để xem thông tin cá nhân, địa chỉ, đơn hàng và ưu đãi của bạn" />
          )}

          <MenuGroup title="Hỗ trợ">{renderItems(SUPPORT_ITEMS)}</MenuGroup>

          {p.isAuthenticated && (
            <TouchableOpacity
              className="flex-row items-center justify-center bg-danger-light rounded-xl py-4"
              onPress={p.logout}
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={18} color={COLORS.danger} />
              <Text className="text-danger font-semibold text-base ml-2">
                Đăng xuất
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
