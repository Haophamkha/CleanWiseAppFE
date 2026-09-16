import type { UserVoucher, Voucher } from "@/types/Voucher";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Props = {
  voucher: Voucher;
  walletVoucher?: UserVoucher;
  onClaim?: (code: string) => void;
  onPress?: () => void;
  isClaiming?: boolean;
};

export const formatVoucherMoney = (value?: string | null) => {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

export const formatVoucherDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const voucherSourceLabel: Record<UserVoucher["source"], string> = {
  PUBLIC: "Voucher công khai",
  CODE: "Nhận bằng mã",
  ADMIN: "Được tặng riêng",
  CAMPAIGN: "Quà từ chiến dịch",
};

const getWalletStatus = (item: UserVoucher) => {
  if (item.is_usable) {
    return { label: "Có thể sử dụng", text: "text-emerald-700", bg: "bg-emerald-50" };
  }
  if (item.status === "USED") {
    return { label: "Đã sử dụng", text: "text-gray-500", bg: "bg-gray-100" };
  }
  if (item.status === "RESERVED") {
    return { label: "Đang được giữ", text: "text-amber-700", bg: "bg-amber-50" };
  }
  if (item.status === "REVOKED") {
    return { label: "Đã thu hồi", text: "text-red-600", bg: "bg-red-50" };
  }
  if (item.voucher.lifecycle_status === "EXPIRED") {
    return { label: "Đã hết hạn", text: "text-gray-500", bg: "bg-gray-100" };
  }
  return { label: "Không khả dụng", text: "text-gray-500", bg: "bg-gray-100" };
};

export function VoucherCard({ voucher, walletVoucher, onClaim, onPress, isClaiming }: Props) {
  const isPercent = voucher.discount_type === "PERCENT";
  const status = walletVoucher ? getWalletStatus(walletVoucher) : null;

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl mb-4 overflow-hidden border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View className="flex-row">
        <View className="w-32 bg-emerald-700 items-center justify-center px-2 py-6">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-2">
            <Feather name={isPercent ? "percent" : "gift"} size={20} color="#FFFFFF" />
          </View>
          <Text
            className="text-white font-extrabold text-center"
            style={{ width: "100%", fontSize: isPercent ? 22 : 17 }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {isPercent
              ? `${Number(voucher.discount_value)}%`
              : formatVoucherMoney(voucher.discount_value)}
          </Text>
          <Text className="text-emerald-100 text-[10px] font-semibold mt-1 uppercase">
            Ưu đãi
          </Text>
        </View>

        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 text-gray-900 text-base font-bold pr-2" numberOfLines={2}>
              {voucher.name}
            </Text>
            {status && (
              <View className={`${status.bg} rounded-full px-2.5 py-1`}>
                <Text className={`${status.text} text-[10px] font-bold`}>{status.label}</Text>
              </View>
            )}
          </View>

          {!!voucher.description && (
            <Text className="text-gray-500 text-xs leading-5 mt-1" numberOfLines={2}>
              {voucher.description}
            </Text>
          )}

          <View className="flex-row items-center mt-3">
            <View className="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg px-2.5 py-1.5">
              <Text className="text-emerald-800 text-xs font-extrabold tracking-wider">
                {voucher.code}
              </Text>
            </View>
            <Text className="text-gray-400 text-[11px] ml-2 flex-1" numberOfLines={1}>
              HSD {formatVoucherDate(voucher.end_at)}
            </Text>
          </View>
        </View>
      </View>

      <View className="border-t border-dashed border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-3">
            <Feather name="shopping-bag" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-2" numberOfLines={1}>
              Đơn tối thiểu {formatVoucherMoney(voucher.min_order_amount)}
            </Text>
          </View>

          {walletVoucher ? (
            <Text className="text-gray-400 text-[11px]">{voucherSourceLabel[walletVoucher.source]}</Text>
          ) : (
            <TouchableOpacity
              className="bg-emerald-700 rounded-xl px-4 py-2.5 min-w-24 items-center"
              onPress={(event) => {
                event.stopPropagation();
                onClaim?.(voucher.code);
              }}
              disabled={isClaiming}
              activeOpacity={0.8}
            >
              {isClaiming ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-xs font-bold">Nhận ngay</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {isPercent && voucher.max_discount_amount && (
          <Text className="text-gray-400 text-[11px] mt-2">
            Giảm tối đa {formatVoucherMoney(voucher.max_discount_amount)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
