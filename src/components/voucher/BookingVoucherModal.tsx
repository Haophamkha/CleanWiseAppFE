import {
  useGetMyVouchersQuery,
  useValidateVoucherMutation,
} from "@/services/voucherApi";
import type {
  UserVoucher,
  ValidateVoucherResponse,
} from "@/types/Voucher";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatVoucherDate, formatVoucherMoney } from "./VoucherCard";

type Props = {
  visible: boolean;
  subtotalAmount: number;
  selectedVoucherId?: number | null;
  onClose: () => void;
  onApplied: (
    userVoucher: UserVoucher,
    validation: ValidateVoucherResponse,
  ) => void;
  onClear: () => void;
};

const statusReason: Partial<Record<UserVoucher["status"], string>> = {
  RESERVED: "Đang được giữ cho đơn hàng khác",
  USED: "Voucher đã được sử dụng",
  REVOKED: "Voucher đã bị thu hồi",
};

function getUnavailableReason(item: UserVoucher, subtotalAmount: number) {
  if (item.status !== "AVAILABLE") {
    return statusReason[item.status] ?? "Voucher không khả dụng";
  }
  if (item.voucher.lifecycle_status === "UPCOMING") {
    return "Voucher chưa đến thời gian sử dụng";
  }
  if (item.voucher.lifecycle_status === "EXPIRED") {
    return "Voucher đã hết hạn";
  }
  if (item.voucher.lifecycle_status === "DISABLED") {
    return "Voucher đã ngừng hoạt động";
  }
  if (!item.is_usable) {
    return "Voucher hiện không khả dụng";
  }

  const minOrderAmount = Number(item.voucher.min_order_amount || 0);
  if (subtotalAmount < minOrderAmount) {
    return `Cần mua thêm ${formatVoucherMoney(String(minOrderAmount - subtotalAmount))}`;
  }
  return null;
}

function getErrorMessage(error: any) {
  const errors = error?.data?.errors ?? error?.data;
  const value =
    errors?.code ??
    errors?.voucher_code ??
    errors?.subtotal_amount ??
    error?.data?.message;

  if (Array.isArray(value)) return value.join("\n");
  return typeof value === "string"
    ? value
    : "Không thể kiểm tra voucher. Vui lòng thử lại.";
}

function VoucherOption({
  item,
  subtotalAmount,
  selected,
  onPress,
}: {
  item: UserVoucher;
  subtotalAmount: number;
  selected: boolean;
  onPress: () => void;
}) {
  const voucher = item.voucher;
  const unavailableReason = getUnavailableReason(item, subtotalAmount);
  const disabled = unavailableReason !== null;
  const isPercent = voucher.discount_type === "PERCENT";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className="rounded-2xl border mb-3 overflow-hidden"
      style={{
        borderColor: selected ? "#059669" : "#E5E7EB",
        backgroundColor: disabled ? "#F9FAFB" : "#FFFFFF",
        opacity: disabled ? 0.68 : 1,
      }}
    >
      <View className="flex-row p-4">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: disabled ? "#E5E7EB" : "#D1FAE5" }}
        >
          <Feather
            name={isPercent ? "percent" : "gift"}
            size={21}
            color={disabled ? "#9CA3AF" : "#047857"}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start">
            <View className="flex-1 pr-2">
              <Text className="text-gray-900 font-extrabold text-[15px]" numberOfLines={1}>
                {voucher.name}
              </Text>
              <Text className="text-emerald-700 font-bold text-sm mt-1">
                {isPercent
                  ? `Giảm ${Number(voucher.discount_value)}%`
                  : `Giảm ${formatVoucherMoney(voucher.discount_value)}`}
              </Text>
            </View>

            <View
              className="w-6 h-6 rounded-full border-2 items-center justify-center"
              style={{
                borderColor: selected ? "#059669" : "#D1D5DB",
                backgroundColor: selected ? "#059669" : "#FFFFFF",
              }}
            >
              {selected && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
          </View>

          <View className="flex-row items-center mt-3">
            <View className="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg px-2 py-1">
              <Text className="text-emerald-800 text-[11px] font-extrabold tracking-wider">
                {voucher.code}
              </Text>
            </View>
            <Text className="text-gray-400 text-[11px] ml-2">
              HSD {formatVoucherDate(voucher.end_at)}
            </Text>
          </View>

          <Text className="text-gray-500 text-xs mt-2">
            Đơn tối thiểu {formatVoucherMoney(voucher.min_order_amount)}
            {isPercent && voucher.max_discount_amount
              ? ` · Tối đa ${formatVoucherMoney(voucher.max_discount_amount)}`
              : ""}
          </Text>

          {unavailableReason && (
            <View className="flex-row items-center mt-2">
              <Feather name="info" size={13} color="#B45309" />
              <Text className="text-amber-700 text-xs ml-1.5 flex-1">
                {unavailableReason}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function BookingVoucherModal({
  visible,
  subtotalAmount,
  selectedVoucherId,
  onClose,
  onApplied,
  onClear,
}: Props) {
  const [pendingVoucherId, setPendingVoucherId] = useState<number | null>(
    selectedVoucherId ?? null,
  );
  const {
    data: walletVouchers = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyVouchersQuery(undefined, {
    skip: !visible,
    refetchOnMountOrArgChange: true,
  });
  const [validateVoucher, { isLoading: isValidating }] =
    useValidateVoucherMutation();

  useEffect(() => {
    if (visible) setPendingVoucherId(selectedVoucherId ?? null);
  }, [selectedVoucherId, visible]);

  const sortedVouchers = useMemo(
    () =>
      [...walletVouchers].sort((left, right) => {
        const leftDisabled = getUnavailableReason(left, subtotalAmount) ? 1 : 0;
        const rightDisabled = getUnavailableReason(right, subtotalAmount) ? 1 : 0;
        return leftDisabled - rightDisabled;
      }),
    [subtotalAmount, walletVouchers],
  );

  const handleApply = async () => {
    if (pendingVoucherId == null) {
      onClear();
      onClose();
      return;
    }

    const selected = walletVouchers.find(
      (item) => item.id === pendingVoucherId,
    );
    if (!selected) return;

    try {
      const result = await validateVoucher({
        code: selected.voucher.code,
        subtotal_amount: subtotalAmount,
      }).unwrap();

      if (Number(result.total_amount) <= 0) {
        Alert.alert(
          "Chưa thể áp dụng voucher",
          "Hệ thống hiện chưa hỗ trợ đơn hàng có tổng thanh toán bằng 0đ.",
        );
        return;
      }

      onApplied(selected, result);
      onClose();
    } catch (error) {
      Alert.alert("Voucher không hợp lệ", getErrorMessage(error));
      refetch();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        <SafeAreaView
          edges={["bottom"]}
          className="bg-white rounded-t-[30px] overflow-hidden"
          style={{ maxHeight: "88%" }}
        >
          <View className="items-center pt-3">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
            <View className="flex-1 pr-4">
              <Text className="text-gray-900 text-lg font-extrabold">
                Chọn voucher
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Giá trị đơn hàng {formatVoucherMoney(String(subtotalAmount))}
              </Text>
            </View>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              onPress={onClose}
            >
              <Feather name="x" size={19} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View className="items-center py-14">
                <ActivityIndicator color="#047857" />
                <Text className="text-gray-400 text-sm mt-3">
                  Đang tải voucher...
                </Text>
              </View>
            ) : isError ? (
              <View className="items-center py-12">
                <Feather name="wifi-off" size={28} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm mt-3">
                  Không thể tải ví voucher
                </Text>
                <TouchableOpacity
                  className="bg-emerald-50 rounded-xl px-4 py-2.5 mt-4"
                  onPress={() => refetch()}
                >
                  <Text className="text-emerald-700 font-bold">Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : sortedVouchers.length === 0 ? (
              <View className="items-center py-12">
                <Feather name="inbox" size={30} color="#9CA3AF" />
                <Text className="text-gray-700 font-bold mt-3">
                  Bạn chưa có voucher
                </Text>
                <Text className="text-gray-400 text-xs mt-1 text-center">
                  Hãy nhận voucher trong mục Khuyến mãi để sử dụng.
                </Text>
              </View>
            ) : (
              sortedVouchers.map((item) => (
                <VoucherOption
                  key={item.id}
                  item={item}
                  subtotalAmount={subtotalAmount}
                  selected={pendingVoucherId === item.id}
                  onPress={() => setPendingVoucherId(item.id)}
                />
              ))
            )}
          </ScrollView>

          <View className="px-5 pt-3 pb-4 border-t border-gray-100">
            {selectedVoucherId != null && (
              <TouchableOpacity
                className="items-center py-2 mb-2"
                onPress={() => setPendingVoucherId(null)}
                disabled={isValidating}
              >
                <Text className="text-gray-500 font-semibold text-sm">
                  Không sử dụng voucher
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-emerald-700 rounded-2xl py-4 items-center"
              style={{
                opacity:
                  isValidating || isFetching || isLoading || isError ? 0.55 : 1,
              }}
              disabled={isValidating || isFetching || isLoading || isError}
              onPress={handleApply}
              activeOpacity={0.85}
            >
              {isValidating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {pendingVoucherId == null ? "Tiếp tục không dùng voucher" : "Áp dụng voucher"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
