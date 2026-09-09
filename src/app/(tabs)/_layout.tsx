import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#047857",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopColor: "#F3F4F6",
          backgroundColor: "#FFFFFF",
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Trang chủ */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Dịch vụ */}
      <Tabs.Screen
        name="services"
        options={{
          title: "Dịch vụ",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />

      {/* Đơn hàng */}
      <Tabs.Screen
        name="booking"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* Tin nhắn */}
      <Tabs.Screen
        name="messages"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />

      {/* Cá nhân */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
