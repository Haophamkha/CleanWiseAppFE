import { Avatar } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function shortTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} ngày`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function ConversationItem({
  item,
  onPress,
}: {
  item: any;
  onPress: () => void;
}) {
  const last = item.last_message;
  const preview: string =
    typeof last === "string"
      ? last
      : (last?.message ?? item.last_message_text ?? "");
  const code: string | undefined =
    item.booking_code ?? item.assignment_code ?? item.code;
  const time = shortTime(
    item.last_message_at ?? item.updated_at ?? last?.created_at,
  );
  const unread = Number(item.unread_count ?? 0);
  const hasUnread = unread > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        flexDirection: "row",
        paddingLeft: 16,
        backgroundColor: COLORS.surface,
      }}
    >
      <View style={{ paddingVertical: 12, paddingRight: 14 }}>
        <Avatar uri={item.other_user?.avatar} size={52} />
      </View>

      <View
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingRight: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: COLORS.line,
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: 17,
              fontWeight: hasUnread ? "700" : "500",
              color: COLORS.ink,
            }}
          >
            {item.other_user?.name}
          </Text>
          {!!code && (
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 6,
                backgroundColor: COLORS.primarySoft,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: COLORS.primaryDark,
                }}
              >
                {code}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 13, color: COLORS.inkMuted, marginLeft: 8 }}>
            {time}
          </Text>
        </View>

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 15,
              color: hasUnread ? COLORS.ink : COLORS.inkSoft,
              fontWeight: hasUnread ? "600" : "400",
            }}
          >
            {preview || "Chưa có tin nhắn"}
          </Text>
          {hasUnread && (
            <View
              style={{
                marginLeft: 8,
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
                borderRadius: 10,
                backgroundColor: COLORS.danger,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
