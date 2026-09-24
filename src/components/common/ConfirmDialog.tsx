import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** true: nút xác nhận màu đỏ, dùng cho hành động phá huỷ/không đảo ngược được */
  danger?: boolean;
};

type Props = ConfirmOptions & {
  visible: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const accentColor = danger ? COLORS.danger : COLORS.primary;
  const accentBg = danger ? "#FEF2F2" : COLORS.primaryLight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(17,24,39,0.5)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 340,
            backgroundColor: COLORS.white,
            borderRadius: 28,
            paddingTop: 28,
            paddingBottom: 20,
            paddingHorizontal: 22,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          <View
            className="self-center items-center justify-center mb-4"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: accentBg,
            }}
          >
            <Feather
              name={danger ? "alert-triangle" : "help-circle"}
              size={26}
              color={accentColor}
            />
          </View>

          <Text
            className="text-[17px] font-bold text-center"
            style={{ color: COLORS.text }}
          >
            {title}
          </Text>

          {!!message && (
            <Text
              className="text-[13.5px] text-center mt-2"
              style={{ color: COLORS.textMuted, lineHeight: 19 }}
            >
              {message}
            </Text>
          )}

          <View className="flex-row mt-6" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.8}
              className="flex-1 items-center justify-center rounded-2xl py-3.5"
              style={{
                backgroundColor: COLORS.background,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text
                className="font-bold text-[14px]"
                style={{ color: COLORS.textSecondary }}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl py-3.5"
              style={{
                backgroundColor: accentColor,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  className="font-bold text-[14px]"
                  style={{ color: "#fff" }}
                >
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
