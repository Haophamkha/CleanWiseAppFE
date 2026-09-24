import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const QUICK_REASONS = [
  "Tôi đổi lịch/kế hoạch",
  "Đặt nhầm dịch vụ",
  "Giá không phù hợp",
  "Tìm được lựa chọn khác",
];

export function CancelBookingModal({
  visible,
  loading,
  isPaidOnline,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  loading?: boolean;
  /** true nếu đơn đã thanh toán online -> hiện ghi chú sẽ hoàn tiền vào ví */
  isPaidOnline?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(17,24,39,0.5)" }}
        onPress={handleClose}
      >
        <View style={{ flex: 1 }} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: 28,
            }}
          >
            <View className="items-center pt-3 pb-1">
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
                }}
              />
            </View>

            <View className="px-6 pt-4">
              <View className="flex-row items-center mb-1">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  <Feather name="x-circle" size={18} color={COLORS.danger} />
                </View>
                <Text
                  className="text-[17px] font-bold"
                  style={{ color: COLORS.text }}
                >
                  Hủy đơn hàng
                </Text>
              </View>

              <Text
                className="text-[13px] mt-2 mb-4"
                style={{ color: COLORS.textMuted, lineHeight: 19 }}
              >
                Vui lòng cho biết lý do hủy để chúng tôi cải thiện dịch vụ.
              </Text>

              {isPaidOnline && (
                <View
                  className="flex-row items-start rounded-2xl px-3.5 py-3 mb-4"
                  style={{ backgroundColor: COLORS.primaryLight }}
                >
                  <Feather
                    name="info"
                    size={14}
                    color={COLORS.primary}
                    style={{ marginTop: 1, marginRight: 8 }}
                  />
                  <Text
                    className="text-[12px] flex-1"
                    style={{ color: COLORS.primary, lineHeight: 17 }}
                  >
                    Đơn này đã thanh toán online. Số tiền sẽ được hoàn ngay vào
                    ví của bạn sau khi hủy.
                  </Text>
                </View>
              )}

              <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
                {QUICK_REASONS.map((r) => {
                  const selected = reason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setReason(r)}
                      activeOpacity={0.8}
                      className="px-3 py-2 rounded-full"
                      style={{
                        backgroundColor: selected
                          ? COLORS.primaryLight
                          : COLORS.background,
                        borderWidth: 1,
                        borderColor: selected
                          ? COLORS.primaryBorder
                          : COLORS.border,
                      }}
                    >
                      <Text
                        className="text-[12.5px] font-medium"
                        style={{
                          color: selected
                            ? COLORS.primary
                            : COLORS.textSecondary,
                        }}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                className="rounded-2xl px-4 py-3 text-[14px] mb-5"
                style={{
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  color: COLORS.text,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                placeholder="Nhập lý do hủy đơn..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                maxLength={500}
                value={reason}
                onChangeText={setReason}
              />

              <View className="flex-row" style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={handleClose}
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
                    Đóng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading || !reason.trim()}
                  activeOpacity={0.85}
                  className="flex-1 items-center justify-center rounded-2xl py-3.5"
                  style={{
                    backgroundColor: COLORS.danger,
                    opacity: loading || !reason.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="font-bold text-[14px] text-white">
                      Xác nhận hủy
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
