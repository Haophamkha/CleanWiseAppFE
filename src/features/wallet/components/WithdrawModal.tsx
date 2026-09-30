import { COLORS, OVERLAY, RADIUS } from "@/constants/theme";
import { useWithdraw } from "@/features/wallet/hooks/useWallet";
import { formatVnd } from "@/utils/currency";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  balance: number;
  onClose: () => void;
};

export function WithdrawModal({ visible, balance, onClose }: Props) {
  const w = useWithdraw(balance, onClose);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={w.close}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: OVERLAY }}
        onPress={w.close}
      >
        <View style={{ flex: 1 }} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            }}
          >
            <View
              style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.line,
                }}
              />
            </View>

            <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: COLORS.ink }}
              >
                Rút tiền về tài khoản
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  marginTop: 4,
                  marginBottom: 20,
                  color: COLORS.inkMuted,
                }}
              >
                Số dư khả dụng {formatVnd(balance)}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  marginBottom: 16,
                  borderRadius: 16,
                  backgroundColor: COLORS.canvas,
                  borderWidth: 1,
                  borderColor: COLORS.line,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    marginRight: 8,
                    color: COLORS.inkMuted,
                  }}
                >
                  đ
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 20,
                    fontWeight: "700",
                    color: COLORS.ink,
                  }}
                  placeholder="0"
                  placeholderTextColor={COLORS.inkMuted}
                  keyboardType="number-pad"
                  value={w.amountText}
                  onChangeText={w.setAmountText}
                />
              </View>

              {w.quickAmounts.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {w.quickAmounts.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => w.setAmountText(String(v))}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: COLORS.primaryLight,
                        borderWidth: 1,
                        borderColor: COLORS.primaryBorder,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: COLORS.primaryDark,
                        }}
                      >
                        {formatVnd(v)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={w.submit}
                disabled={w.isLoading}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: COLORS.primary,
                  opacity: w.isLoading ? 0.6 : 1,
                }}
              >
                {w.isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Gửi yêu cầu
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
