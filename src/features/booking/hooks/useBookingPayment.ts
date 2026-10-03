import { ROUTES } from "@/config/constants";
import {
  useCreatePaymentLinkMutation,
  useGetBookingDetailQuery,
} from "@/features/booking/api/bookingApi";
import { formatVnd } from "@/utils/currency";
import * as Crypto from "expo-crypto";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";

// Tránh gọi lại liên tục nếu đồng hồ máy lệch so với server
const MIN_REFETCH_GAP_MS = 5000;

const formatCountdown = (sec: number) =>
  `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

export function useBookingPayment() {
  const { bookingId, code } = useLocalSearchParams<{
    bookingId: string;
    code: string;
  }>();
  const id = Number(bookingId);

  const [createPaymentLink, { data: link, isLoading, error }] =
    useCreatePaymentLinkMutation();
  const requested = useRef(false);
  const lastFetchAt = useRef(0);

  const [now, setNow] = useState(Date.now());
  const [unavailable, setUnavailable] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [opening, setOpening] = useState(false);

  const goBackToConfirm = () => {
    router.replace(ROUTES.BOOKING_CONFIRM as any);
  };

  const fetchLink = async () => {
    if (!id) return;
    lastFetchAt.current = Date.now();
    try {
      // Key mới mỗi lần lấy link: link cũ hết hạn thì cần link mới thật sự
      await createPaymentLink({
        bookingId: id,
        idempotencyKey: Crypto.randomUUID(),
      }).unwrap();
    } catch (e: any) {
      // 404: đơn đã trả / đã hủy / hết hạn thanh toán
      if (e?.status === 404) setUnavailable(true);
    }
  };

  const openCheckout = async () => {
    if (!link?.checkout_url || expired) return;
    try {
      setOpening(true);
      await WebBrowser.openBrowserAsync(link.checkout_url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
      });
    } finally {
      setOpening(false);
    }
  };

  // Lấy link lần đầu
  useEffect(() => {
    if (id && !requested.current) {
      requested.current = true;
      fetchLink();
    }
  }, [id]);

  // Đếm ngược theo expires_at của BE
  useEffect(() => {
    if (!link) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [link]);

  const expiresAtMs = link?.expires_at
    ? new Date(link.expires_at).getTime()
    : null;
  const secondsLeft = expiresAtMs
    ? Math.max(0, Math.ceil((expiresAtMs - now) / 1000))
    : 0;
  const expired = !!link && secondsLeft <= 0;

  // Hết hạn thì tự lấy link mới
  useEffect(() => {
    if (!expired || isLoading || unavailable) return;
    if (Date.now() - lastFetchAt.current < MIN_REFETCH_GAP_MS) return;
    fetchLink();
  }, [expired, isLoading, unavailable]);

  // Poll trạng thái đơn
  const { data: booking } = useGetBookingDetailQuery(id, {
    skip: !id || unavailable,
    pollingInterval: 3000,
  });

  const paid =
    booking?.payment?.status === "SUCCESS" ||
    booking?.payment_status === "PAID";

  useEffect(() => {
    if (paid) {
      WebBrowser.dismissBrowser();
      router.replace({ pathname: "/booking/success" as any, params: { code } });
    }
  }, [paid, code]);

  // Đơn bị hủy / hết hạn nhận (ví dụ tự hủy sau 30 phút chưa trả)
  useEffect(() => {
    if (booking && ["CANCELLED", "FAILED"].includes(booking.status)) {
      setUnavailable(true);
    }
  }, [booking?.status]);

  const hasError = Boolean(error) && !unavailable;

  return {
    code,
    link,
    isLoading,
    hasError,
    expired,
    unavailable,
    refreshLink: fetchLink,
    showLink:
      !!link?.checkout_url &&
      !expired &&
      !isLoading &&
      !hasError &&
      !unavailable,
    isUrgent: secondsLeft <= 60 && !expired,
    countdownText: formatCountdown(secondsLeft),
    totalText: booking?.total_amount
      ? formatVnd(Number(booking.total_amount))
      : "—",
    showQr,
    toggleQr: () => setShowQr((v) => !v),
    opening,
    openCheckout,
    goBackToConfirm,
  };
}
