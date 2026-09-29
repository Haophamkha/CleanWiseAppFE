import { COLORS } from "@/constants/theme";
import { formatFullDateTime, type UiChatMessage } from "@/features/chat/utils";
import type { ChatAssignment } from "@/types/chat";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const AVATAR = 36;

export function SystemMessageCard({
  message,
  assignment,
}: {
  message: UiChatMessage;
  assignment?: ChatAssignment;
}) {
  const sub = assignment
    ? [assignment.service_name, assignment.booking_code]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        marginVertical: 6,
      }}
    >
      <View
        style={{
          width: AVATAR,
          height: AVATAR,
          marginRight: 8,
          borderRadius: AVATAR / 2,
          backgroundColor: COLORS.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="bell" size={18} color={COLORS.primary} />
      </View>

      <View
        style={{
          maxWidth: "80%",
          flexShrink: 1,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 6,
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        }}
      >
        <Text
          style={{ fontSize: 15, fontWeight: "700", color: COLORS.primaryDark }}
        >
          Thông báo lịch làm
        </Text>
        {!!sub && (
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, marginTop: 1, color: COLORS.inkSoft }}
          >
            {sub}
          </Text>
        )}

        <View
          style={{
            height: StyleSheet.hairlineWidth,
            marginVertical: 8,
            backgroundColor: COLORS.line,
          }}
        />

        <Text style={{ fontSize: 16, lineHeight: 22, color: COLORS.ink }}>
          {message.message}
        </Text>
        <Text style={{ fontSize: 12, marginTop: 4, color: COLORS.inkMuted }}>
          {formatFullDateTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}
