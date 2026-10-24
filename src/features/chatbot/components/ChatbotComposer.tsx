import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  draft: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
  closed: boolean;
};

export function ChatbotComposer({
  draft,
  onChange,
  onSend,
  disabled,
  closed,
}: Props) {
  const { t } = useTranslation();

  const { mode: themeMode } = useAppTheme();

  const { COLORS } = useAppTheme();

  const canSend = !disabled && !closed && !!draft.trim();
  return (
    <View className="bg-canvas px-4 pt-3 pb-2">
      {closed ? (
        <View className="flex-row items-center justify-center py-3">
          <Feather name="lock" size={15} color={COLORS.inkSoft} />
          <Text className="text-ink-soft text-sm ml-2">
            {t("Hội thoại đã đóng. Tạo trò chuyện mới để tiếp tục.")}</Text>
        </View>
      ) : (
        <View className="flex-row items-end rounded-3xl bg-surface border border-line p-1.5">
          <TextInput keyboardAppearance={themeMode}
            value={draft}
            onChangeText={onChange}
            placeholder={t("Hỏi Trợ lý CleanWise...")}
            placeholderTextColor={COLORS.inkMuted}
            multiline
            maxLength={2000}
            editable={!disabled}
            accessibilityLabel={t("Nhập câu hỏi cho trợ lý")}
            className="flex-1 text-ink text-[15px] px-3"
            style={{
              minHeight: 42,
              maxHeight: 104,
              paddingTop: 10,
              paddingBottom: 10,
              textAlignVertical: "center",
            }}
          />
          <TouchableOpacity
            onPress={onSend}
            disabled={!canSend}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t("Gửi câu hỏi")}
            accessibilityState={{ disabled: !canSend }}
            style={{ backgroundColor: canSend ? COLORS.primaryFill : COLORS.line }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Feather
              name="arrow-up"
              size={22}
              color={canSend ? COLORS.white : COLORS.inkMuted}
            />
          </TouchableOpacity>
        </View>
      )}
      {draft.length > 1800 && (
        <Text className="text-right text-ink-muted text-[10px] mt-1.5 mr-3">
          {draft.length}{t("/2000 ký tự")}</Text>
      )}
    </View>
  );
}
