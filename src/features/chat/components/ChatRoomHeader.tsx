import { Avatar } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ChatRoomHeader({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.line,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={10}
        style={{ paddingRight: 12 }}
      >
        <Feather name="arrow-left" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={{ marginRight: 12 }}>
        <Avatar uri={avatar} size={40} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 17, fontWeight: "600", color: "#000" }}
        >
          {name}
        </Text>
        <Text numberOfLines={1} style={{ fontSize: 13, color: "#000" }}>
          Nhân viên phụ trách
        </Text>
      </View>
    </View>
  );
}
