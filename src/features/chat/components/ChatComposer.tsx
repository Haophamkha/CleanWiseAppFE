import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  canSend: boolean;
  draft: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onSend: () => void;
  bottomPadding: number;
};

export function ChatComposer({
  canSend,
  draft,
  onChange,
  onBlur,
  onSend,
  bottomPadding,
}: Props) {
  const box = {
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.line,
  } as const;

  if (!canSend) {
    return (
      <View
        style={[
          box,
          {
            paddingTop: 12,
            paddingBottom: bottomPadding,
            paddingHorizontal: 16,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="lock" size={14} color={COLORS.inkMuted} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 13,
              color: COLORS.inkSoft,
              flexShrink: 1,
            }}
          >
            Lịch này đã kết thúc, bạn vẫn có thể xem lịch sử trò chuyện.
          </Text>
        </View>
      </View>
    );
  }

  const hasText = !!draft.trim();

  return (
    <View
      style={[
        box,
        {
          flexDirection: "row",
          alignItems: "flex-end",
          paddingLeft: 16,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <TextInput
        value={draft}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder="Tin nhắn"
        placeholderTextColor={COLORS.inkMuted}
        multiline
        maxLength={2000}
        style={{
          flex: 1,
          maxHeight: 112,
          minHeight: 44,
          fontSize: 17,
          color: COLORS.ink,
          paddingTop: 10,
          paddingBottom: 10,
          textAlignVertical: "center",
        }}
      />
      {hasText && (
        <TouchableOpacity
          onPress={onSend}
          activeOpacity={0.7}
          style={{
            height: 44,
            width: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="send" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
