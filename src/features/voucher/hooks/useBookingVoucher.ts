import {
    useGetMyVouchersQuery,
    useValidateVoucherMutation,
} from "@/features/voucher/api/voucherApi";
import { formatVoucherMoney } from "@/features/voucher/components/VoucherCard";
import type {
    UserVoucher,
    ValidateVoucherResponse,
} from "@/features/voucher/types/Voucher";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

const statusReason: Partial<Record<UserVoucher["status"], string>> = {
  RESERVED: "Đang được giữ cho đơn hàng khác",
  USED: "Voucher đã được sử dụng",
  REVOKED: "Voucher đã bị thu hồi",
};

export function getUnavailableReason(
  item: UserVoucher,
  subtotalAmount: number,
) {
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

type Params = {
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

export function useBookingVoucher({
  visible,
  subtotalAmount,
  selectedVoucherId,
  onClose,
  onApplied,
  onClear,
}: Params) {
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
        const rightDisabled = getUnavailableReason(right, subtotalAmount)
          ? 1
          : 0;
        return leftDisabled - rightDisabled;
      }),
    [subtotalAmount, walletVouchers],
  );

  const apply = async () => {
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

  return {
    pendingVoucherId,
    setPendingVoucherId,
    sortedVouchers,
    isLoading,
    isFetching,
    isError,
    refetch,
    isValidating,
    apply,
    blocked: isValidating || isFetching || isLoading || isError,
  };
}
