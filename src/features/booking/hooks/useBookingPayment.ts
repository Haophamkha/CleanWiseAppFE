import { ROUTES } from "@/config/constants";
import {
    useCreatePaymentLinkMutation,
    useGetBookingDetailQuery,
} from "@/services/bookingApi";
import { formatVnd } from "@/utils/currency";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";

const QR_TTL_SECONDS = 5 * 60;
const AUTO_REDIRECT_DELAY_MS = 2500;

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

  const [secondsLeft, setSecondsLeft] = useState(QR_TTL_SECONDS);
  const [expired, setExpired] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [opening, setOpening] = useState(false);

  const goBackToConfirm = () => {
    router.replace(ROUTES.BOOKING_CONFIRM as any);
  };

  const fetchLink = () => {
    setSecondsLeft(QR_TTL_SECONDS);
    setExpired(false);
    createPaymentLink({
      bookingId: id,
      idempotencyKey: `payment-link-booking-${id}`,
    });
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

  useEffect(() => {
    if (id && !requested.current) {
      requested.current = true;
      fetchLink();
    }
  }, [id]);

  // Đếm ngược
  useEffect(() => {
    if (!link?.checkout_url || expired) return;
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, link?.checkout_url, expired]);

  // Hết hạn thì tự quay về màn xác nhận sau vài giây
  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(goBackToConfirm, AUTO_REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [expired]);

  // Poll trạng thái thanh toán
  const { data: booking } = useGetBookingDetailQuery(id, {
    skip: !id || expired,
    pollingInterval: 3000,
  });
  const paymentStatus = booking?.payment?.status;

  useEffect(() => {
    if (paymentStatus === "SUCCESS") {
      WebBrowser.dismissBrowser();
      router.replace({ pathname: "/booking/success" as any, params: { code } });
    }
  }, [paymentStatus, code]);

  const hasError = Boolean(error);

  return {
    code,
    link,
    isLoading,
    hasError,
    expired,
    showLink: !!link?.checkout_url && !expired && !isLoading && !hasError,
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
