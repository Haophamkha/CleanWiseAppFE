import { useTranslation } from "react-i18next";

import {
  BRAND_COLORS,
  BrandIcon,
  type BrandName,
} from "@/components/common/BrandIcon";
import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { getLocalizedAppInfo } from "@/config/appInfo";
import { ROUTES } from "@/config/constants";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const open = (url: string) => Linking.openURL(url).catch(() => {});

const goBack = () => {
  if (router.canGoBack()) router.back();
  else router.replace(ROUTES.HOME as any);
};

function ChannelItem({
  brand,
  label,
  onPress,
}: {
  brand: BrandName;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 items-center"
      style={{ paddingVertical: 16 }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${BRAND_COLORS[brand]}1A`,
        }}
      >
        <BrandIcon name={brand} size={24} />
      </View>
      <Text
        className="text-ink font-semibold"
        style={{ fontSize: 12, marginTop: 8 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const { t } = useTranslation();
  const { COLORS, SHADOWS, GRADIENTS, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const info = getLocalizedAppInfo(t);
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 32,
        }}
      >
        {/* Header gradient mint */}
        <LinearGradient
          colors={GRADIENTS.hero}
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: 32,
            paddingHorizontal: 20,
          }}
        >
          <TouchableOpacity
            onPress={goBack}
            hitSlop={8}
            activeOpacity={0.7}
            className="bg-surface items-center justify-center"
            style={[{ width: 40, height: 40, borderRadius: 20 }, SHADOWS.card]}
          >
            <Feather name="arrow-left" size={20} color={COLORS.ink} />
          </TouchableOpacity>

          <View className="items-center" style={{ marginTop: 8 }}>
            <View
              className="bg-surface items-center justify-center"
              style={[
                { width: 96, height: 96, borderRadius: 32 },
                SHADOWS.float,
              ]}
            >
              <View
                className="items-center justify-center"
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 24,
                  backgroundColor: COLORS.primaryFill,
                }}
              >
                <Feather name="home" size={36} color={COLORS.white} />
              </View>
            </View>

            <Text
              className="text-ink font-extrabold"
              style={{
                fontSize: 28,
                lineHeight: 34,
                marginTop: 16,
                letterSpacing: -0.3,
              }}
            >
              {info.name}
            </Text>
            <Text
              className="text-ink-soft text-center"
              style={{
                fontSize: 14,
                lineHeight: 20,
                marginTop: 4,
                paddingHorizontal: 16,
              }}
            >
              {info.tagline}
            </Text>

            <View
              className="flex-row items-center bg-surface"
              style={{
                marginTop: 14,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.primary,
                  marginRight: 6,
                }}
              />
              <Text
                className="text-ink-soft font-semibold"
                style={{ fontSize: 12 }}
              >
                {t("Phiên bản")} {version}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-5" style={{ paddingTop: 20 }}>
          {/* Liên hệ */}
          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
            {t("Liên hệ")}
          </Text>
          <View
            className="bg-surface border border-line flex-row"
            style={[{ borderRadius: 24, marginBottom: 24 }, SHADOWS.card]}
          >
            <ChannelItem
              brand="zalo"
              label="Zalo"
              onPress={() => open(info.zalo)}
            />
            <View
              className="bg-line"
              style={{ width: 1, marginVertical: 16 }}
            />
            <ChannelItem
              brand="phone"
              label={t("Gọi")}
              onPress={() => open(`tel:${info.hotline}`)}
            />
            <View
              className="bg-line"
              style={{ width: 1, marginVertical: 16 }}
            />
            <ChannelItem
              brand="email"
              label="Email"
              onPress={() => open(`mailto:${info.email}`)}
            />
            <View
              className="bg-line"
              style={{ width: 1, marginVertical: 16 }}
            />
            <ChannelItem
              brand="facebook"
              label="Facebook"
              onPress={() => open(info.facebook)}
            />
          </View>

          {/* Giới thiệu */}
          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2 ml-1">
            {t("Về chúng tôi")}
          </Text>
          <View
            className="bg-surface border border-line"
            style={{ borderRadius: 24, padding: 20, marginBottom: 24 }}
          >
            <Text
              className="text-ink-soft"
              style={{ fontSize: 14, lineHeight: 23 }}
            >
              {info.description}
            </Text>

            <View className="h-px bg-line" style={{ marginVertical: 18 }} />

            {info.highlights.map((h, i) => (
              <View
                key={h.title}
                className="flex-row items-center"
                style={{ marginTop: i === 0 ? 0 : 16 }}
              >
                <View
                  className="bg-primary-soft items-center justify-center"
                  style={{ width: 44, height: 44, borderRadius: 14 }}
                >
                  <Feather name={h.icon} size={20} color={COLORS.primary} />
                </View>
                <View className="flex-1" style={{ marginLeft: 14 }}>
                  <Text
                    className="text-ink font-semibold"
                    style={{ fontSize: 15 }}
                  >
                    {h.title}
                  </Text>
                  <Text
                    className="text-ink-muted"
                    style={{ fontSize: 13, marginTop: 2 }}
                  >
                    {h.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Nhà phát triển */}
          <View
            className="bg-surface border border-line flex-row items-center"
            style={{ borderRadius: 24, padding: 16, marginBottom: 24 }}
          >
            <View
              className="bg-primary-soft items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: 22 }}
            >
              <Feather name="code" size={20} color={COLORS.primary} />
            </View>
            <View className="flex-1" style={{ marginLeft: 12 }}>
              <Text className="text-ink-muted" style={{ fontSize: 12 }}>
                {t("Phát triển bởi")}
              </Text>
              <Text
                className="text-ink font-semibold"
                style={{ fontSize: 15, marginTop: 2 }}
              >
                {info.developer}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => open(info.zalo)}
              activeOpacity={0.8}
              className="flex-row items-center"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: `${BRAND_COLORS.zalo}1A`,
              }}
            >
              <BrandIcon name="zalo" size={16} />
              <Text
                className="font-semibold"
                style={{
                  fontSize: 12,
                  color: BRAND_COLORS.zalo,
                  marginLeft: 6,
                }}
              >
                {t("Nhắn tin")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pháp lý */}
          <MenuGroup title={t("Pháp lý")}>
            <MenuListItem
              icon="file-text"
              label={t("Điều khoản dịch vụ")}
              onPress={() => open(info.terms)}
            />
            <MenuListItem
              icon="lock"
              label={t("Chính sách bảo mật")}
              onPress={() => open(info.privacy)}
            />
          </MenuGroup>

          <Text
            className="text-center text-ink-muted"
            style={{ fontSize: 12, marginTop: 4 }}
          >
            {t("© {{value0}} CleanWise. Bảo lưu mọi quyền.", { value0: new Date().getFullYear() })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
