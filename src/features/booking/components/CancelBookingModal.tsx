import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <BottomSheet visible={visible} onClose={handleClose}>
      <View className="px-6 pt-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl bg-danger-light items-center justify-center mr-3">
            <Feather name="x-circle" size={22} color={COLORS.danger} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-ink">Hủy đơn hàng</Text>
            <Text className="text-[13px] text-ink-muted mt-0.5">
              Cho chúng tôi biết lý do để cải thiện dịch vụ.
            </Text>
          </View>
        </View>

        {isPaidOnline && (
          <View className="flex-row items-start rounded-2xl bg-primary-soft border border-primary-border px-3.5 py-3 mt-4">
            <Feather
              name="info"
              size={15}
              color={COLORS.primaryDark}
              style={{ marginTop: 1, marginRight: 8 }}
            />
            <Text className="flex-1 text-[12px] leading-[17px] text-primary-dark">
              Đơn này đã thanh toán online. Số tiền sẽ được hoàn ngay vào ví của
              bạn sau khi hủy.
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap mt-4 mb-3" style={{ gap: 8 }}>
          {QUICK_REASONS.map((r) => {
            const selected = reason === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                activeOpacity={0.85}
                className={`px-3.5 py-2 rounded-full border ${
                  selected
                    ? "bg-primary-light border-primary"
                    : "bg-canvas border-line"
                }`}
              >
                <Text
                  className={`text-[12.5px] font-semibold ${
                    selected ? "text-primary-dark" : "text-ink-soft"
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          className="rounded-2xl border border-line bg-canvas px-4 py-3 text-[14px] text-ink mb-5"
          style={{ minHeight: 88, textAlignVertical: "top" }}
          placeholder="Nhập lý do hủy đơn..."
          placeholderTextColor={COLORS.inkMuted}
          multiline
          numberOfLines={3}
          maxLength={500}
          value={reason}
          onChangeText={setReason}
        />

        <View className="flex-row" style={{ gap: 10 }}>
          <Button
            title="Đóng"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onPress={handleClose}
          />
          <Button
            title="Xác nhận hủy"
            variant="danger"
            className="flex-1"
            loading={loading}
            disabled={loading || !reason.trim()}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
