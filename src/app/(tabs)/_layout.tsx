import { COLORS, SHADOWS } from "@/constants/theme";
import { useGetConversationsQuery } from "@/features/chat/api/chatApi";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useAppSelector } from "@/store/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef, type ComponentProps } from "react";
import {
  Animated,
  Easing,
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
type Options = BottomTabBarProps["descriptors"][string]["options"];

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

type ItemProps = {
  options: Options;
  label: string;
  focused: boolean;
  width: number;
  onPress: () => void;
  onLongPress: () => void;
};

/** Tab thường: nhấn thì co lại, chọn thì icon nảy lên và viên thuốc nền phóng ra */
function TabItem({
  options,
  label,
  focused,
  width,
  onPress,
  onLongPress,
}: ItemProps) {
  const active = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const badge = options.tabBarBadge;
  const tint = focused ? COLORS.primary : COLORS.inkMuted;

  useEffect(() => {
    Animated.spring(active, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [focused, active]);

  const pressTo = (v: number) =>
    Animated.spring(press, {
      toValue: v,
      useNativeDriver: true,
      damping: 14,
      stiffness: 300,
    }).start();

  const translateY = active.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const pillScale = active.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => pressTo(0.88)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
      style={{ width, height: BAR_HEIGHT }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 8,
          alignSelf: "center",
          width: 54,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: press }, { translateY }],
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 54,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.primaryLight,
            opacity: active,
            transform: [{ scale: pillScale }],
          }}
        />
        {options.tabBarIcon?.({ focused, color: tint, size: 22 })}
        {badge !== undefined && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: 2,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              borderRadius: 9,
              backgroundColor: COLORS.danger,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: COLORS.surface,
            }}
          >
            <Text
              style={{ color: COLORS.white, fontSize: 10, fontWeight: "700" }}
            >
              {badge}
            </Text>
          </View>
        )}
      </Animated.View>

      <Text
        numberOfLines={1}
        style={{
          position: "absolute",
          top: 44,
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
    </Pressable>
  );
}

/**
 * Nút Chatbot giữa:
 * - Nhấn giữ: nút lún xuống, icon nhỏ lại
 * - Thả ra: nút bật lại có độ nảy, một vòng sóng lan tỏa ra ngoài
 * - Khi được chọn: icon xoay một vòng, viền sáng lên
 */
function CenterItem({
  options,
  label,
  focused,
  width,
  onPress,
  onLongPress,
}: ItemProps) {
  const press = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      damping: 9,
      stiffness: 160,
    }).start();
  }, [focused, pop]);

  const pressIn = () =>
    Animated.spring(press, {
      toValue: 0.86,
      useNativeDriver: true,
      damping: 15,
      stiffness: 400,
    }).start();

  const pressOut = () =>
    Animated.spring(press, {
      toValue: 1,
      useNativeDriver: true,
      damping: 6, // thấp hơn để bật lại có độ nảy
      stiffness: 260,
    }).start();

  const handlePress = () => {
    pulse.setValue(0);
    Animated.timing(pulse, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    onPress();
  };

  const rotate = pop.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const lift = pop.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });
  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.75],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });
  const iconScale = press.interpolate({
    inputRange: [0.86, 1],
    outputRange: [0.85, 1],
    extrapolate: "extend",
  });

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
      style={{ width, height: BAR_HEIGHT }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -OVERHANG,
          alignSelf: "center",
          width: CIRCLE,
          height: CIRCLE,
        }}
      >
        {/* Vòng sóng lan tỏa khi nhấn */}
        <Animated.View
          style={{
            position: "absolute",
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: CIRCLE / 2,
            backgroundColor: COLORS.primary,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }}
        />

        <Animated.View
          style={[
            {
              width: CIRCLE,
              height: CIRCLE,
              borderRadius: CIRCLE / 2,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 3,
              borderColor: focused ? COLORS.primaryLight : COLORS.primary,
              transform: [{ scale: press }, { translateY: lift }],
            },
            SHADOWS.float,
          ]}
        >
          <Animated.View
            style={{ transform: [{ rotate }, { scale: iconScale }] }}
          >
            {options.tabBarIcon?.({
              focused,
              color: COLORS.white,
              size: 28,
            })}
          </Animated.View>
        </Animated.View>
      </View>

      <Text
        numberOfLines={1}
        style={{
          position: "absolute",
          top: 44,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11,
          fontWeight: focused ? "700" : "500",
          color: focused ? COLORS.primary : COLORS.inkMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
          <Path
            d={path}
            fill={COLORS.ink}
            fillOpacity={0.04}
            transform="translate(0,-4)"
          />
          <Path
            d={path}
            fill={COLORS.ink}
            fillOpacity={0.05}
            transform="translate(0,-2)"
          />
          <Path d={path} fill={COLORS.surface} />
        </Svg>

        <View style={{ flexDirection: "row", height: BAR_HEIGHT }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const label =
              typeof options.title === "string" ? options.title : route.name;

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

            const Item = index === centerIndex ? CenterItem : TabItem;

            return (
              <Item
                key={route.key}
                options={options}
                label={label}
                focused={focused}
                width={slotWidth}
                onPress={onPress}
                onLongPress={onLongPress}
              />
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
      if (
        event.type === "message.created" ||
        event.type === "messages.read" ||
        event.type === "conversation.updated"
      )
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

      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Trợ lý",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "robot-happy" : "robot-happy-outline"}
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
