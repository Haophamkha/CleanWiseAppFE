import {
    useClaimVoucherByCodeMutation,
    useGetMyVouchersQuery,
    useGetPublicVouchersQuery,
} from "@/services/voucherApi";
import { useAppSelector } from "@/store/hooks";
import type { UserVoucher, Voucher } from "@/types/Voucher";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useMemo, useState } from "react";
import { Keyboard } from "react-native";

export type VoucherTab = "discover" | "mine";
export type SelectedVoucher = {
  voucher: Voucher;
  walletVoucher?: UserVoucher;
};

const getApiErrorMessage = (error: any) => {
  const errors = error?.data?.errors;
  const fieldError =
    errors?.code ?? errors?.voucher ?? errors?.non_field_errors;
  if (Array.isArray(fieldError)) return fieldError[0];
  if (typeof fieldError === "string") return fieldError;
  return error?.data?.message ?? "Không thể nhận voucher. Vui lòng thử lại.";
};

export function useVouchers() {
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<VoucherTab>("discover");
  const [voucherCode, setVoucherCode] = useState("");
  const [claimingCode, setClaimingCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] =
    useState<SelectedVoucher | null>(null);

  const publicQuery = useGetPublicVouchersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const walletQuery = useGetMyVouchersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [claimVoucher, claimState] = useClaimVoucherByCodeMutation();

  const data = useMemo(
    () =>
      activeTab === "discover"
        ? (publicQuery.data ?? [])
        : (walletQuery.data ?? []),
    [activeTab, publicQuery.data, walletQuery.data],
  );
  const currentQuery = activeTab === "discover" ? publicQuery : walletQuery;

  const claim = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      showErrorToast("Thiếu mã voucher", "Vui lòng nhập mã bạn muốn nhận.");
      return false;
    }

    Keyboard.dismiss();
    setClaimingCode(code);
    try {
      await claimVoucher(code).unwrap();
      setVoucherCode("");
      showSuccessToast(
        "Đã nhận voucher",
        `${code} đã được thêm vào ví của bạn.`,
      );
      return true;
    } catch (error) {
      showErrorToast("Không thể nhận voucher", getApiErrorMessage(error));
      return false;
    } finally {
      setClaimingCode(null);
    }
  };

  // Đang claim đúng mã này?
  const isClaiming = (code?: string | null) =>
    claimState.isLoading && !!code && claimingCode === code;

  return {
    isAuthenticated,
    activeTab,
    setActiveTab,
    voucherCode,
    setVoucherCode,
    data,
    isLoading: currentQuery.isLoading,
    isError: currentQuery.isError,
    isFetching: currentQuery.isFetching,
    refetch: () => currentQuery.refetch(),
    claim,
    isClaiming,
    isClaimingAny: claimState.isLoading,
    selectedVoucher,
    openDetail: (voucher: Voucher, walletVoucher?: UserVoucher) =>
      setSelectedVoucher({ voucher, walletVoucher }),
    closeDetail: () => setSelectedVoucher(null),
  };
}
