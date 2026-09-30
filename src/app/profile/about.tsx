import {
    BRAND_COLORS,
    BrandIcon,
    type BrandName,
} from "@/components/common/BrandIcon";
import { MenuGroup } from "@/components/common/MenuGroup";
import { MenuListItem } from "@/components/common/MenuListItem";
import { APP_INFO } from "@/config/appInfo";
import { ROUTES } from "@/config/constants";
import { COLORS, ON_DARK, RADIUS, SHADOWS } from "@/constants/theme";
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

const CARD = [{ borderRadius: RADIUS.card }, SHADOWS.card] as const;

function ChannelTile({
  brand,
  label,
  onPress,
  isFirst,
}: {
  brand: BrandName;
  label: string;
  onPress: () => void;
  isFirst?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 bg-surface items-center py-3.5"
      style={[...CARD, { marginLeft: isFirst ? 0 : 10 }]}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: `${BRAND_COLORS[brand]}1A` }}
      >
        <BrandIcon name={brand} size={26} />
      </View>
      <Text className="text-xs font-semibold text-ink mt-2">{label}</Text>
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 32,
        }}
      >
        {/* Hero đậm để chữ trắng đọc rõ */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: 64,
            paddingHorizontal: 20,
            borderBottomLeftRadius: RADIUS.hero,
            borderBottomRightRadius: RADIUS.hero,
            overflow: "hidden",
          }}
        >
          {/* Vòng tròn trang trí */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -60,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -40,
              left: -40,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          <TouchableOpacity
            onPress={goBack}
            hitSlop={8}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center border"
            style={{
              backgroundColor: ON_DARK.surface,
              borderColor: ON_DARK.border,
            }}
          >
            <Feather name="arrow-left" size={20} color={ON_DARK.text} />
          </TouchableOpacity>

          <View className="items-center mt-1">
            <View
              className="w-24 h-24 bg-surface items-center justify-center"
              style={[{ borderRadius: 30 }, SHADOWS.float]}
            >
              <Feather name="home" size={44} color={COLORS.primary} />
            </View>
            <Text
              className="text-3xl font-bold mt-4"
              style={{ color: ON_DARK.text }}
            >
              {APP_INFO.name}
            </Text>
            <Text
              className="text-sm mt-1 text-center"
              style={{ color: ON_DARK.textSoft }}
            >
              {APP_INFO.tagline}
            </Text>
            <View
              className="rounded-full px-3 py-1 mt-4 border"
              style={{
                backgroundColor: ON_DARK.surface,
                borderColor: ON_DARK.border,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: ON_DARK.text }}
              >
                Phiên bản {version}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-5">
          {/* Kênh liên hệ đè lên hero */}
          <View
            className="flex-row"
            style={{ marginTop: -36, marginBottom: 20 }}
          >
            <ChannelTile
              isFirst
              brand="zalo"
              label="Zalo"
              onPress={() => open(APP_INFO.zalo)}
            />
            <ChannelTile
              brand="phone"
              label="Gọi"
              onPress={() => open(`tel:${APP_INFO.hotline}`)}
            />
            <ChannelTile
              brand="email"
              label="Email"
              onPress={() => open(`mailto:${APP_INFO.email}`)}
            />
            <ChannelTile
              brand="facebook"
              label="Facebook"
              onPress={() => open(APP_INFO.facebook)}
            />
          </View>

          {/* Giới thiệu */}
          <View
            className="bg-surface p-5"
            style={[...CARD, { marginBottom: 20 }]}
          >
            <Text className="text-lg font-bold text-ink">Về chúng tôi</Text>
            <Text className="text-sm text-ink-soft leading-6 mt-2">
              {APP_INFO.description}
            </Text>

            <View className="h-px bg-line" style={{ marginVertical: 16 }} />

            {APP_INFO.highlights.map((h, i) => (
              <View
                key={h.title}
                className="flex-row items-center"
                style={{ marginTop: i === 0 ? 0 : 16 }}
              >
                <View className="w-11 h-11 rounded-2xl bg-primary-soft items-center justify-center">
                  <Feather name={h.icon} size={20} color={COLORS.primary} />
                </View>
                <View className="flex-1" style={{ marginLeft: 12 }}>
                  <Text className="font-semibold text-ink">{h.title}</Text>
                  <Text
                    className="text-xs text-ink-muted"
                    style={{ marginTop: 2 }}
                  >
                    {h.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Nhà phát triển */}
          <View
            className="bg-surface p-4 flex-row items-center"
            style={[...CARD, { marginBottom: 20 }]}
          >
            <View className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center">
              <Feather name="code" size={22} color={COLORS.primary} />
            </View>
            <View className="flex-1" style={{ marginLeft: 12, marginRight: 8 }}>
              <Text className="text-xs text-ink-muted">Phát triển bởi</Text>
              <Text className="font-semibold text-ink" style={{ marginTop: 2 }}>
                {APP_INFO.developer}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => open(APP_INFO.zalo)}
              activeOpacity={0.8}
              className="flex-row items-center rounded-full px-3 py-2"
              style={{ backgroundColor: `${BRAND_COLORS.zalo}1A` }}
            >
              <BrandIcon name="zalo" size={18} />
              <Text
                className="text-xs font-semibold"
                style={{ color: BRAND_COLORS.zalo, marginLeft: 6 }}
              >
                Nhắn tin
              </Text>
            </TouchableOpacity>
          </View>

          <MenuGroup title="Pháp lý">
            <MenuListItem
              icon="file-text"
              label="Điều khoản dịch vụ"
              onPress={() => open(APP_INFO.terms)}
            />
            <MenuListItem
              icon="lock"
              label="Chính sách bảo mật"
              onPress={() => open(APP_INFO.privacy)}
            />
          </MenuGroup>

          <Text className="text-center text-xs text-ink-muted mt-2">
            © {new Date().getFullYear()} CleanWise. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
