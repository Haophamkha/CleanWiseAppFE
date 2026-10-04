import { useGetPaymentMethodsQuery } from "@/features/payment/api/paymentMethodApi";
import {
  useCreateTopupMutation,
  useGetTopupQuery,
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useGetWithdrawQuery,
  useMockConfirmTopupMutation,
  useRequestWithdrawMutation,
  walletApi,
} from "@/features/wallet/api/walletApi";
import { useRefreshControl } from "@/hooks/useRefreshControl";
import { getApiErrorMessage } from "@/utils/apiError";
import * as Crypto from "expo-crypto";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, Linking } from "react-native";
import { useDispatch } from "react-redux";

// Khớp hạn mức BE giai đoạn đầu. Muốn test số nhỏ thì hạ BE (WALLET_*_MIN) và hạ ở đây.
export const TOPUP_MIN = 1000;
export const TOPUP_MAX = 20000000;
export const WITHDRAW_MIN = 1000;
export const WITHDRAW_MAX = 2000000;

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];
const POLL_MS = 3000;

/** Key gắn với "ý định" (chữ ký = số tiền + tài khoản). Đổi chữ ký thì sinh key mới. */
function useIntentKey() {
  const ref = useRef<{ sig: string; key: string } | null>(null);
  const getKey = (sig: string) => {
    if (!ref.current || ref.current.sig !== sig) {
      ref.current = { sig, key: Crypto.randomUUID() };
    }
    return ref.current.key;
  };
  const resetKey = () => {
    ref.current = null;
  };
  return { getKey, resetKey };
}

/** Lỗi chưa rõ BE đã xử lý chưa: mất mạng, timeout, 409, 5xx. Phải giữ nguyên key khi thử lại. */
const isUncertain = (err: any) => {
  const s = err?.status;
  return !s || s === 409 || s >= 500;
};

/* ============================ màn ví ============================ */

export function useWallet() {
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [topupVisible, setTopupVisible] = useState(false);

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
    transactions: txData?.results ?? [],
    txLoading,
    withdrawVisible,
    openWithdraw: () => setWithdrawVisible(true),
    closeWithdraw: () => setWithdrawVisible(false),
    topupVisible,
    openTopup: () => setTopupVisible(true),
    closeTopup: () => setTopupVisible(false),
  };
}

/* ============================ rút tiền ============================ */

export function useWithdraw(balance: number, onClose: () => void) {
  const dispatch = useDispatch();
  const [amountText, setAmountText] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [withdrawId, setWithdrawId] = useState<number | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [requestWithdraw, { isLoading }] = useRequestWithdrawMutation();
  const { getKey, resetKey } = useIntentKey();

  const { data: allMethods = [], isLoading: methodsLoading } =
    useGetPaymentMethodsQuery();
  const methods = useMemo(
    () => allMethods.filter((m) => m.method_type === "BANK_ACCOUNT"),
    [allMethods],
  );
  const selected =
    methods.find((m) => m.id === selectedId) ??
    methods.find((m) => m.is_default) ??
    methods[0] ??
    null;

  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const [pollDone, setPollDone] = useState(false);
  const { data: polled } = useGetWithdrawQuery(withdrawId ?? 0, {
    skip: withdrawId == null,
    pollingInterval: pollDone ? 0 : POLL_MS,
  });
  const record = polled ?? null;
  const status = record?.status ?? createdStatus;
  const finished = status === "SUCCESS" || status === "FAILED";

  // Có kết quả cuối thì dừng poll và cập nhật ví
  useEffect(() => {
    if (finished) {
      setPollDone(true);
      dispatch(walletApi.util.invalidateTags(["Wallet", "WalletTransactions"]));
    }
  }, [finished, dispatch]);

  const amount = Number(amountText.replace(/[^0-9]/g, ""));
  const quickAmounts = QUICK_AMOUNTS.filter(
    (v) => v <= balance && v <= WITHDRAW_MAX,
  );

  const reset = () => {
    resetKey();
    setAmountText("");
    setWithdrawId(null);
    setCreatedStatus(null);
    setUncertain(false);
    setErrorText("");
    setPollDone(false);
  };

  const close = () => {
    if (uncertain) {
      Alert.alert(
        "Chưa rõ kết quả",
        "Yêu cầu rút trước đó có thể đã được gửi. Hãy kiểm tra lịch sử giao dịch trước khi rút lại.",
      );
    }
    reset();
    onClose();
  };

  const submit = async () => {
    setErrorText("");
    if (!selected) {
      setErrorText("Vui lòng thêm tài khoản ngân hàng để nhận tiền.");
      return;
    }
    if (!amount || amount < WITHDRAW_MIN) {
      setErrorText(
        `Số tiền rút tối thiểu là ${WITHDRAW_MIN.toLocaleString("vi-VN")}đ.`,
      );
      return;
    }
    if (amount > WITHDRAW_MAX) {
      setErrorText(
        `Mỗi lần rút tối đa ${WITHDRAW_MAX.toLocaleString("vi-VN")}đ.`,
      );
      return;
    }
    if (amount > balance) {
      setErrorText("Số tiền rút vượt quá số dư trong ví.");
      return;
    }

    try {
      const res = await requestWithdraw({
        amount,
        paymentMethodId: selected.id,
        idempotencyKey: getKey(`${amount}:${selected.id}`),
      }).unwrap();
      resetKey(); // lần rút sau dùng key khác
      setUncertain(false);
      setPollDone(false);
      setWithdrawId(res.id);
      setCreatedStatus(res.status);
    } catch (err: any) {
      if (err?.status === 429) return; // interceptor đã báo toast
      if (isUncertain(err)) {
        // GIỮ key: bấm lại sẽ không tạo lệnh mới nếu lần trước đã thành công
        setUncertain(true);
        setErrorText(
          err?.status === 503
            ? "Hệ thống tạm thời chưa xử lý được. Bấm Gửi lại sau ít giây, bạn sẽ không bị rút trùng."
            : "Chưa rõ yêu cầu đã được gửi chưa. Bấm Gửi lại, bạn sẽ không bị rút trùng.",
        );
      } else {
        resetKey();
        setUncertain(false);
        setErrorText(
          getApiErrorMessage(
            err,
            "Không thể gửi yêu cầu rút tiền, vui lòng thử lại.",
          ),
        );
      }
    }
  };

  return {
    amountText,
    setAmountText,
    quickAmounts,
    isLoading,
    uncertain,
    errorText,
    methods,
    methodsLoading,
    selected,
    selectMethod: setSelectedId,
    record,
    status,
    submittedAmount: record ? Number(record.amount) : amount,
    submitted: withdrawId != null,
    close,
    submit,
  };
}

/* ============================ nạp tiền ============================ */

export function useTopup(onClose: () => void) {
  const dispatch = useDispatch();
  const [amountText, setAmountText] = useState("");
  const [topupId, setTopupId] = useState<number | null>(null);
  const [errorText, setErrorText] = useState("");
  const [uncertain, setUncertain] = useState(false);

  const [createTopup, { isLoading }] = useCreateTopupMutation();
  const [mockConfirm, { isLoading: mockLoading }] =
    useMockConfirmTopupMutation();
  const { getKey, resetKey } = useIntentKey();

  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const [pollDone, setPollDone] = useState(false);
  const { data: polled, refetch } = useGetTopupQuery(topupId ?? 0, {
    skip: topupId == null,
    pollingInterval: pollDone ? 0 : POLL_MS,
    skipPollingIfUnfocused: false,
  });
  const status = polled?.status ?? createdStatus;
  const finished = status != null && status !== "PENDING";
  const url = polled?.checkout_url ?? checkoutUrl;

  // Có kết quả cuối (SUCCESS / EXPIRED...) thì dừng poll
  useEffect(() => {
    if (finished) setPollDone(true);
  }, [finished]);

  const stopPollRef = useRef(false);
  stopPollRef.current = finished;

  useEffect(() => {
    if (status === "SUCCESS") {
      dispatch(walletApi.util.invalidateTags(["Wallet", "WalletTransactions"]));
    }
  }, [status, dispatch]);

  // Quay lại app từ trình duyệt thanh toán -> kiểm tra ngay
  useEffect(() => {
    if (topupId == null) return;
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && !stopPollRef.current) refetch();
    });
    return () => sub.remove();
  }, [topupId, refetch]);

  const amount = Number(amountText.replace(/[^0-9]/g, ""));

  const reset = () => {
    resetKey();
    setAmountText("");
    setTopupId(null);
    setCreatedStatus(null);
    setCheckoutUrl(null);
    setErrorText("");
    setUncertain(false);
    setPollDone(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const openCheckout = (target?: string | null) => {
    const link = target ?? url;
    if (!link) return;
    Linking.openURL(link).catch(() =>
      Alert.alert("Không mở được trang thanh toán", "Vui lòng thử lại."),
    );
  };

  const submit = async () => {
    setErrorText("");
    if (!amount || amount < TOPUP_MIN) {
      setErrorText(
        `Số tiền nạp tối thiểu là ${TOPUP_MIN.toLocaleString("vi-VN")}đ.`,
      );
      return;
    }
    if (amount > TOPUP_MAX) {
      setErrorText(`Mỗi lần nạp tối đa ${TOPUP_MAX.toLocaleString("vi-VN")}đ.`);
      return;
    }
    try {
      const res = await createTopup({
        amount,
        idempotencyKey: getKey(String(amount)),
      }).unwrap();
      resetKey();
      setUncertain(false);
      setPollDone(false);
      setTopupId(res.id);
      setCreatedStatus(res.status);
      setCheckoutUrl(res.checkout_url);
      openCheckout(res.checkout_url);
    } catch (err: any) {
      if (err?.status === 429) return;
      if (isUncertain(err)) {
        setUncertain(true);
        setErrorText(
          "Chưa rõ yêu cầu đã được tạo chưa. Bấm thử lại, bạn sẽ không bị tạo trùng.",
        );
      } else {
        resetKey();
        setUncertain(false);
        setErrorText(
          getApiErrorMessage(
            err,
            "Không thể tạo liên kết nạp tiền, vui lòng thử lại.",
          ),
        );
      }
    }
  };

  const mockPay = async () => {
    if (topupId == null) return;
    try {
      await mockConfirm(topupId).unwrap();
      refetch();
    } catch (err: any) {
      setErrorText(getApiErrorMessage(err, "Giả lập thanh toán thất bại."));
    }
  };

  return {
    amountText,
    setAmountText,
    quickAmounts: QUICK_AMOUNTS,
    isLoading,
    uncertain,
    errorText,
    submitted: topupId != null,
    status,
    finished,
    amountValue: polled ? Number(polled.amount) : amount,
    checkoutUrl: url,
    openCheckout: () => openCheckout(),
    mockPay: __DEV__ ? mockPay : undefined,
    mockLoading,
    close,
    submit,
  };
}
