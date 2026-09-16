import type { UserVoucher, Voucher } from "@/types/Voucher";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatVoucherDate,
  formatVoucherMoney,
  voucherSourceLabel,
} from "./VoucherCard";

type Props = {
  visible: boolean;
  voucher: Voucher | null;
  walletVoucher?: UserVoucher;
  isClaiming?: boolean;
  onClose: () => void;
  onClaim?: (code: string) => Promise<boolean>;
};

const distributionLabel: Record<Voucher["distribution_type"], string> = {
  PUBLIC: "Voucher công khai",
  CODE_ONLY: "Nhận bằng mã",
  ASSIGNED: "Được cấp riêng",
};

const lifecycleLabel: Record<Voucher["lifecycle_status"], string> = {
  ACTIVE: "Đang hoạt động",
  UPCOMING: "Sắp diễn ra",
  EXPIRED: "Đã hết hạn",
  EXHAUSTED: "Đã hết lượt nhận",
  DISABLED: "Đã ngừng hoạt động",
};

const walletStatusLabel: Record<UserVoucher["status"], string> = {
  AVAILABLE: "Có thể sử dụng",
  RESERVED: "Đang được giữ cho đơn hàng",
  USED: "Đã sử dụng",
  REVOKED: "Đã thu hồi",
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center mr-3">
        <Feather name={icon} size={16} color="#047857" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-400 text-xs">{label}</Text>
        <Text className="text-gray-800 text-sm font-semibold mt-1 leading-5">{value}</Text>
      </View>
    </View>
  );
}

export function VoucherDetailModal({
  visible,
  voucher,
  walletVoucher,
  isClaiming,
  onClose,
  onClaim,
}: Props) {
  if (!voucher) return null;

  const isPercent = voucher.discount_type === "PERCENT";
  const discountLabel = isPercent
    ? `Giảm ${Number(voucher.discount_value)}%`
    : `Giảm ${formatVoucherMoney(voucher.discount_value)}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        <View className="bg-white rounded-t-[32px] max-h-[88%] overflow-hidden">
          <View className="items-center pt-3">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
            <View className="flex-1 pr-4">
              <Text className="text-gray-900 text-lg font-extrabold">Chi tiết voucher</Text>
              <Text className="text-gray-400 text-xs mt-1">Kiểm tra điều kiện trước khi sử dụng</Text>
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              onPress={onClose}
            >
              <Feather name="x" size={19} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 12 }}>
            <View className="bg-emerald-700 rounded-3xl p-5 mb-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                  <Feather name={isPercent ? "percent" : "gift"} size={23} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-100 text-xs font-semibold">{discountLabel}</Text>
                  <Text className="text-white text-xl font-extrabold mt-1">{voucher.name}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between bg-white/15 rounded-2xl px-4 py-3 mt-4">
                <Text className="text-emerald-100 text-xs">Mã voucher</Text>
                <Text className="text-white font-extrabold tracking-widest">{voucher.code}</Text>
              </View>
            </View>

            {!!voucher.description && (
              <View className="bg-gray-50 rounded-2xl p-4 mb-2">
                <Text className="text-gray-500 text-xs font-bold uppercase">Mô tả ưu đãi</Text>
                <Text className="text-gray-700 text-sm leading-6 mt-2">{voucher.description}</Text>
              </View>
            )}

            <DetailRow
              icon="dollar-sign"
              label="Giá trị ưu đãi"
              value={discountLabel}
            />
            {isPercent && voucher.max_discount_amount && (
              <DetailRow
                icon="trending-down"
                label="Mức giảm tối đa"
                value={formatVoucherMoney(voucher.max_discount_amount)}
              />
            )}
            <DetailRow
              icon="shopping-bag"
              label="Giá trị đơn tối thiểu"
              value={formatVoucherMoney(voucher.min_order_amount)}
            />
            <DetailRow
              icon="calendar"
              label="Thời gian hiệu lực"
              value={`${formatVoucherDate(voucher.start_at)} - ${formatVoucherDate(voucher.end_at)}`}
            />
            <DetailRow
              icon="send"
              label="Hình thức phát hành"
              value={distributionLabel[voucher.distribution_type]}
            />
            <DetailRow
              icon="activity"
              label="Trạng thái"
              value={
                walletVoucher
                  ? walletStatusLabel[walletVoucher.status]
                  : lifecycleLabel[voucher.lifecycle_status]
              }
            />
            {voucher.remaining_issuance != null && !walletVoucher && (
              <DetailRow
                icon="users"
                label="Số lượng còn lại"
                value={`${voucher.remaining_issuance} voucher`}
              />
            )}
            {walletVoucher && (
              <DetailRow
                icon="inbox"
                label="Nguồn nhận"
                value={voucherSourceLabel[walletVoucher.source]}
              />
            )}

            <View className="flex-row items-start bg-amber-50 rounded-2xl p-4 mt-4">
              <Feather name="info" size={17} color="#B45309" />
              <Text className="flex-1 text-amber-800 text-xs leading-5 ml-3">
                Mỗi tài khoản chỉ nhận voucher này một lần. Voucher chỉ áp dụng khi đơn hàng đáp ứng đủ điều kiện.
              </Text>
            </View>
          </ScrollView>

          <View className="px-5 pt-3 pb-8 border-t border-gray-100">
            {walletVoucher ? (
              <View className={`rounded-2xl py-4 items-center ${walletVoucher.is_usable ? "bg-emerald-50" : "bg-gray-100"}`}>
                <Text className={`font-bold ${walletVoucher.is_usable ? "text-emerald-700" : "text-gray-500"}`}>
                  {walletVoucher.is_usable ? "Voucher có thể sử dụng" : "Voucher hiện không khả dụng"}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-emerald-700 rounded-2xl py-4 items-center"
                onPress={async () => {
                  const claimed = await onClaim?.(voucher.code);
                  if (claimed) onClose();
                }}
                disabled={isClaiming}
                activeOpacity={0.8}
              >
                {isClaiming ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">Nhận voucher</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
