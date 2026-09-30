import { COLORS } from "@/constants/theme";
import { useGetConversationsQuery } from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useAppSelector } from "@/store/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef, type ComponentProps } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type BottomTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const BAR_HEIGHT = 70;
const BAR_RADIUS = 26; // chỉ bo 2 góc trên
const CIRCLE = 60; // đường kính nút tròn giữa
const OVERHANG = 26; // nút tròn nhô lên trên thanh bao nhiêu px
const NOTCH_HALF_WIDTH = 52;
const NOTCH_DEPTH = 36;

function buildBarPath(width: number) {
  const cx = width / 2;
  const x1 = cx - NOTCH_HALF_WIDTH;
  const x2 = cx + NOTCH_HALF_WIDTH;
  const r = BAR_RADIUS;
  const h = BAR_HEIGHT;
  return [
    `M 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `L ${x1} 0`,
    `C ${x1 + 18} 0 ${cx - 34} ${NOTCH_DEPTH} ${cx} ${NOTCH_DEPTH}`,
    `C ${cx + 34} ${NOTCH_DEPTH} ${x2 - 18} 0 ${x2} 0`,
    `L ${width - r} 0`,
    `Q ${width} 0 ${width} ${r}`,
    `L ${width} ${h}`,
    `L 0 ${h}`,
    "Z",
  ].join(" ");
}

function ActiveDot({ visible, color }: { visible: boolean; color: string }) {
  const scale = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      damping: 14,
      stiffness: 200,
    }).start();
  }, [visible, scale]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 10,
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}

function CurvedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: barWidth } = useWindowDimensions();
  const count = state.routes.length;
  const slotWidth = barWidth / count;
  const centerIndex = Math.floor(count / 2);
  const path = buildBarPath(barWidth);

  return (
    <View
      style={{
        backgroundColor: COLORS.canvas,
        height: BAR_HEIGHT + insets.bottom,
        overflow: "visible",
      }}
    >
      <View
        style={{ width: barWidth, height: BAR_HEIGHT, overflow: "visible" }}
      >
        {/* Nền thanh + bóng đổ giả hướng lên trên */}
        <Svg
          width={barWidth}
          height={BAR_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          <Path d={path} fill="rgba(0,0,0,0.04)" transform="translate(0,-4)" />
          <Path d={path} fill="rgba(0,0,0,0.05)" transform="translate(0,-2)" />
          <Path d={path} fill={COLORS.surface} />
        </Svg>

        <View style={{ flexDirection: "row", height: BAR_HEIGHT }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const isCenter = index === centerIndex;
            const label =
              typeof options.title === "string" ? options.title : route.name;
            const badge = options.tabBarBadge;
            const tint = focused ? COLORS.primary : COLORS.inkMuted;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                style={{ width: slotWidth, height: BAR_HEIGHT }}
              >
                {isCenter ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -OVERHANG,
                      alignSelf: "center",
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: CIRCLE / 2,
                      backgroundColor: COLORS.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      elevation: 6,
                      shadowColor: COLORS.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  >
                    {options.tabBarIcon?.({
                      focused,
                      color: "#FFFFFF",
                      size: 28,
                    })}
                  </View>
                ) : (
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      alignSelf: "center",
                    }}
                  >
                    {options.tabBarIcon?.({ focused, color: tint, size: 22 })}
                    {badge !== undefined && (
                      <View
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -12,
                          minWidth: 18,
                          height: 18,
                          paddingHorizontal: 4,
                          borderRadius: 9,
                          backgroundColor: "#EF4444",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1.5,
                          borderColor: COLORS.surface,
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          {badge}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Tên tab: hiện ở mọi tab, kể cả nút giữa */}
                <Text
                  numberOfLines={1}
                  style={{
                    position: "absolute",
                    top: isCenter ? 40 : 38,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: focused ? "700" : "500",
                    color: tint,
                  }}
                >
                  {label}
                </Text>

                <ActiveDot visible={focused} color={COLORS.primary} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Vùng an toàn dưới đáy cùng màu với thanh */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: insets.bottom,
          backgroundColor: COLORS.surface,
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: conversations, refetch } = useGetConversationsQuery(1, {
    skip: !user,
    refetchOnMountOrArgChange: 15,
  });
  useChatSocket(
    !!user,
    (event) => {
      if (event.type === "message.created" || event.type === "messages.read")
        refetch();
    },
    refetch,
  );
  const unreadCount = user ? (conversations?.total_unread ?? 0) : 0;

  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Chatbot: tab giữa, hiển thị thành nút tròn nổi */}
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chatbot",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Tin nhắn",
          tabBarBadge:
            unreadCount > 0
              ? unreadCount > 99
                ? "99+"
                : unreadCount
              : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
