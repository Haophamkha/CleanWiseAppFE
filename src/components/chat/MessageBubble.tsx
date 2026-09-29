import { Avatar } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import type { UiChatMessage } from "@/features/chat/utils";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  item: UiChatMessage;
  mine: boolean;
  showAvatar: boolean;
  sameAsOlder: boolean;
  showTime: boolean;
  showMetadata: boolean;
  otherAvatar?: string | null;
  myAvatar?: string | null;
  onToggle: () => void;
  onRetry: () => void;
};

const AVATAR = 36;

export function hhmm(iso?: string | number | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MessageBubble({
  item,
  mine,
  showAvatar,
  sameAsOlder,
  showTime,
  showMetadata,
  otherAvatar,
  onToggle,
  onRetry,
}: Props) {
  const failed = item.localStatus === "failed";
  const sending = item.localStatus === "sending";

  const statusLabel = sending
    ? "Đang gửi"
    : failed
      ? "Gửi lỗi, chạm để thử lại"
      : item.is_read
        ? "Đã xem"
        : "Đã gửi";
  const statusIcon = failed ? "alert-circle" : sending ? "clock" : "check";

  return (
    <View style={{ paddingHorizontal: 12, marginBottom: sameAsOlder ? 3 : 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: mine ? "flex-end" : "flex-start",
        }}
      >
        {!mine && (
          <View style={{ width: AVATAR, marginRight: 8 }}>
            {showAvatar && <Avatar uri={otherAvatar} size={AVATAR} />}
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onToggle}
          style={{
            maxWidth: "78%",
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: showTime ? 6 : 8,
            borderRadius: 16,
            backgroundColor: mine ? COLORS.primarySoft : COLORS.surface,
            borderWidth: mine ? 0 : 0.5,
            borderColor: COLORS.line,
            opacity: sending ? 0.7 : 1,
          }}
        >
          <Text style={{ fontSize: 16, lineHeight: 22, color: COLORS.ink }}>
            {item.message}
          </Text>
          {showTime && (
            <Text
              style={{ fontSize: 12, marginTop: 2, color: COLORS.inkMuted }}
            >
              {hhmm(item.created_at)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {mine && showMetadata && (
        <View style={{ alignItems: "flex-end", marginTop: 4 }}>
          <TouchableOpacity
            onPress={onRetry}
            disabled={!failed}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 12,
              backgroundColor: failed
                ? COLORS.danger
                : "rgba(100,110,120,0.55)",
            }}
          >
            <Feather name={statusIcon as any} size={12} color="#fff" />
            <Text style={{ marginLeft: 4, fontSize: 12, color: "#fff" }}>
              {statusLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
