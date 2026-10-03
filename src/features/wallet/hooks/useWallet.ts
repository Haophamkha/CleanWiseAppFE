import { useIdempotencyKey } from "@/features/booking/hooks/useIdempotencyKey";
import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useRequestWithdrawMutation,
} from "@/features/wallet/api/walletApi";
import { useRefreshControl } from "@/hooks/useRefreshControl";
import { useState } from "react";
import { Alert } from "react-native";

const WITHDRAW_MIN = 1000;
const WITHDRAW_QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export function useWallet() {
  const [withdrawVisible, setWithdrawVisible] = useState(false);

  const {
    data: wallet,
    isLoading: walletLoading,
    isFetching: walletFetching,
    refetch,
  } = useGetWalletQuery();
  const balance = wallet ? Number(wallet.balance) : 0;

  const {
    data: txData,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useGetWalletTransactionsQuery({ page_size: 20 });

  const { refreshing, onRefresh } = useRefreshControl(() =>
    Promise.all([refetch(), refetchTx()]),
  );

  const isInitialLoading = walletLoading && !wallet;

  return {
    balance,
    refreshing,
    onRefresh,
    isInitialLoading,
    isBackgroundFetching: walletFetching && !isInitialLoading && !refreshing,
    withdrawVisible,
    transactions: txData?.results ?? [],
    txLoading,
    openWithdraw: () => setWithdrawVisible(true),
    closeWithdraw: () => setWithdrawVisible(false),
  };
}

export function useWithdraw(balance: number, onClose: () => void) {
  const [amountText, setAmountText] = useState("");
  const [requestWithdraw, { isLoading }] = useRequestWithdrawMutation();
  const { getKey, resetKey } = useIdempotencyKey();

  const quickAmounts = WITHDRAW_QUICK_AMOUNTS.filter((v) => v <= balance);

  const close = () => {
    resetKey(); // đóng modal chưa submit thành công -> hủy ý định rút hiện tại
    onClose();
  };

  const submit = async () => {
    const amount = Number(amountText.replace(/[^0-9]/g, ""));

    if (!amount || amount < WITHDRAW_MIN) {
      Alert.alert("Số tiền không hợp lệ", "Số tiền rút tối thiểu là 1.000đ.");
      return;
    }
    if (amount > balance) {
      Alert.alert("Số dư không đủ", "Số tiền rút vượt quá số dư trong ví.");
      return;
    }

    try {
      await requestWithdraw({ amount, idempotencyKey: getKey() }).unwrap();
      resetKey(); // thành công -> lần rút sau dùng key khác
      setAmountText("");
      onClose();
      Alert.alert(
        "Đã gửi yêu cầu",
        "Yêu cầu rút tiền đã được ghi nhận, chờ admin xử lý.",
      );
    } catch (err: any) {
      // KHÔNG resetKey() -> bấm lại do lỗi mạng vẫn dùng key cũ, BE không tạo request mới
      const message =
        err?.data?.amount?.[0] ||
        err?.data?.message ||
        "Không thể gửi yêu cầu rút tiền, vui lòng thử lại.";
      Alert.alert("Lỗi", String(message));
    }
  };

  return { amountText, setAmountText, quickAmounts, isLoading, close, submit };
}
