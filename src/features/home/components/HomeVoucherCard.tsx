import type { Voucher } from "@/features/voucher/types/Voucher";
import { Text, TouchableOpacity, View } from "react-native";

const money = (v: string | number) => `${Number(v).toLocaleString("vi-VN")}đ`;

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function HomeVoucherCard({
  voucher,
  onPress,
}: {
  voucher: Voucher;
  onPress: () => void;
}) {
  const discount =
    voucher.discount_type === "PERCENT"
      ? `Giảm ${Number(voucher.discount_value)}%`
      : `Giảm ${money(voucher.discount_value)}`;
  const condition =
    Number(voucher.min_order_amount) > 0
      ? `Đơn từ ${money(voucher.min_order_amount)}`
      : "Áp dụng mọi đơn";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: 250 }}
      className="bg-accent-light rounded-xl p-4 mr-3"
    >
      <Text className="text-xl font-extrabold text-accent-dark">
        {discount}
      </Text>
      <Text className="text-sm font-semibold text-ink mt-1" numberOfLines={1}>
        {voucher.name}
      </Text>
      <Text className="text-xs text-ink-soft mt-1">{condition}</Text>
      <View className="flex-row items-center justify-between mt-4">
        <View className="bg-surface rounded-full px-3 py-1">
          <Text className="text-xs font-bold text-ink">{voucher.code}</Text>
        </View>
        <Text className="text-xs text-ink-soft">
          HSD {shortDate(voucher.end_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
