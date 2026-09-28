import { COLORS } from "@/components/service/formFieldShared";
import { ROUTES } from "@/config/constants";
import {
  useCreatePaymentLinkMutation,
  useGetBookingDetailQuery,
} from "@/services/bookingApi";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const QR_TTL_SECONDS = 5 * 60;
const AUTO_REDIRECT_DELAY_MS = 2500;

function formatCountdown(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BookingQrScreen() {
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
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [opening, setOpening] = useState(false);

  const fetchLink = () => {
    setSecondsLeft(QR_TTL_SECONDS);
    setExpired(false);
    createPaymentLink({
      bookingId: id,
      idempotencyKey: `payment-link-booking-${id}`,
    });
  };

  const handleCopyCode = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenCheckout = async () => {
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

  const handleGoBackToConfirm = () => {
    router.replace(ROUTES.BOOKING_CONFIRM as any);
  };

  useEffect(() => {
    if (id && !requested.current) {
      requested.current = true;
      fetchLink();
    }
  }, [id]);

  useEffect(() => {
    if (!link?.checkout_url || expired) return;

    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, link?.checkout_url, expired]);

  // Tự động chuyển về confirm sau khi hết hạn (cho user vài giây để thấy trạng thái)
  useEffect(() => {
    if (!expired) return;

    const t = setTimeout(() => {
      handleGoBackToConfirm();
    }, AUTO_REDIRECT_DELAY_MS);

    return () => clearTimeout(t);
  }, [expired]);

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

  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const isUrgent = secondsLeft <= 60 && !expired;

  const steps = [
    "Nhấn “Mở trang thanh toán”",
    "Chọn ngân hàng hoặc ví điện tử bạn muốn dùng",
    "Xác nhận thanh toán trong app đó",
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      <View
        style={{ backgroundColor: COLORS.white }}
        className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.background }}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-gray-900 flex-1">
          Thanh toán đơn hàng
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 24,
          alignItems: "center",
        }}
      >
        {/* Card mã đơn */}
        <View
          style={{
            width: "100%",
            borderRadius: 18,
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: COLORS.border,
            paddingHorizontal: 16,
            paddingVertical: 13,
            marginBottom: 12,
          }}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <Feather name="file-text" size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text
                className="text-[11px] font-bold uppercase"
                style={{ color: COLORS.textMuted, letterSpacing: 0.4 }}
              >
                Mã đơn hàng
              </Text>
              <Text
                className="text-[16px] font-extrabold mt-0.5"
                style={{ color: COLORS.text, letterSpacing: 0.5 }}
              >
                {code}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCopyCode}
            activeOpacity={0.8}
            className="flex-row items-center px-3 py-2 rounded-xl"
            style={{
              backgroundColor: copied ? COLORS.primary : COLORS.primaryLight,
            }}
          >
            <Feather
              name={copied ? "check" : "copy"}
              size={13}
              color={copied ? "#fff" : COLORS.primary}
            />
            <Text
              className="text-[12px] font-bold ml-1.5"
              style={{ color: copied ? "#fff" : COLORS.primary }}
            >
              {copied ? "Đã chép" : "Sao chép"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card thanh toán chính */}
        <View
          style={{
            width: "100%",
            borderRadius: 28,
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.12,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 24,
            elevation: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{ backgroundColor: COLORS.primary }}
            className="items-center py-5"
          >
            <Text
              className="font-semibold text-[12px]"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              Số tiền cần thanh toán
            </Text>
            <Text className="font-extrabold text-[28px] text-white mt-1">
              {booking?.total_amount
                ? Number(booking.total_amount).toLocaleString("vi-VN") + " đ"
                : "—"}
            </Text>
          </View>

          <View className="items-center px-5 pt-7 pb-6">
            {isLoading && (
              <View
                style={{ height: 160 }}
                className="items-center justify-center"
              >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                  className="text-[13px] mt-3"
                  style={{ color: COLORS.textMuted }}
                >
                  Đang tạo link thanh toán...
                </Text>
              </View>
            )}

            {Boolean(error) && !isLoading && (
              <View
                style={{ height: 160 }}
                className="items-center justify-center px-6"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  <Feather
                    name="alert-triangle"
                    size={24}
                    color={COLORS.danger}
                  />
                </View>
                <Text
                  style={{ color: COLORS.danger }}
                  className="text-center text-[13px] font-medium"
                >
                  Không tạo được link thanh toán, vui lòng thử lại.
                </Text>
              </View>
            )}

            {link?.checkout_url && !expired && !isLoading && !error && (
              <>
                <TouchableOpacity
                  onPress={handleOpenCheckout}
                  activeOpacity={0.85}
                  disabled={opening}
                  className="flex-row items-center justify-center w-full rounded-2xl py-4"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {opening ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="external-link" size={17} color="#fff" />
                      <Text className="text-white font-bold ml-2 text-[15px]">
                        Mở trang thanh toán
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text
                  className="text-[11.5px] text-center mt-2.5 px-2"
                  style={{ color: COLORS.textMuted }}
                >
                  Bạn có thể chọn ngân hàng hoặc ví điện tử bất kỳ ngay trong
                  trang thanh toán
                </Text>

                <View
                  style={{
                    marginTop: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 999,
                    backgroundColor: isUrgent
                      ? COLORS.danger
                      : COLORS.primaryLight,
                    borderWidth: 1,
                    borderColor: isUrgent
                      ? COLORS.danger
                      : COLORS.primaryBorder,
                  }}
                  className="flex-row items-center"
                >
                  <Feather
                    name="clock"
                    size={11}
                    color={isUrgent ? "#fff" : COLORS.primary}
                  />
                  <Text
                    className="ml-1 text-[11px] font-bold"
                    style={{ color: isUrgent ? "#fff" : COLORS.primary }}
                  >
                    Còn {formatCountdown(secondsLeft)}
                  </Text>
                </View>

                {/* QR để phụ - toggle */}
                <TouchableOpacity
                  onPress={() => setShowQr((v) => !v)}
                  activeOpacity={0.7}
                  className="flex-row items-center mt-5"
                >
                  <Text
                    className="text-[12.5px] font-semibold"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {showQr ? "Ẩn mã QR" : "Hoặc quét mã QR"}
                  </Text>
                  <Feather
                    name={showQr ? "chevron-up" : "chevron-down"}
                    size={15}
                    color={COLORS.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {showQr && (
                  <View
                    style={{
                      marginTop: 14,
                      padding: 16,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <QRCode value={link.qr_code} size={200} />
                  </View>
                )}
              </>
            )}

            {expired && (
              <View
                style={{ height: 220 }}
                className="items-center justify-center rounded-2xl"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: COLORS.background }}
                >
                  <Feather name="clock" size={24} color={COLORS.textMuted} />
                </View>
                <Text
                  className="text-center text-[13px] font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  Link thanh toán đã hết hạn
                </Text>
                <Text
                  className="text-center text-[12px] mt-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Đang quay về trang đặt lịch...
                </Text>
              </View>
            )}

            {/* Trạng thái */}
            {!expired && link?.checkout_url && (
              <View
                style={{
                  width: "100%",
                  borderTopWidth: 1,
                  borderStyle: "dashed",
                  borderColor: COLORS.border,
                  marginTop: 20,
                  paddingTop: 16,
                }}
                className="items-center"
              >
                <View className="flex-row items-center">
                  <Animated.View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: COLORS.primary,
                      opacity: pulse,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    className="text-[12.5px]"
                    style={{ color: COLORS.textMuted }}
                  >
                    Đang chờ thanh toán...
                  </Text>
                </View>
              </View>
            )}

            {expired && (
              <TouchableOpacity
                onPress={handleGoBackToConfirm}
                activeOpacity={0.85}
                className="flex-row items-center px-5 py-2.5 rounded-2xl mt-2"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Feather name="refresh-cw" size={15} color="#fff" />
                <Text className="text-white font-bold ml-2 text-[13px]">
                  Đặt lại để lấy link mới
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hướng dẫn */}
        <View
          className="mt-4 w-full rounded-2xl px-4 py-4"
          style={{
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text
            className="font-bold text-[13px] mb-3"
            style={{ color: COLORS.text }}
          >
            Hướng dẫn thanh toán
          </Text>
          {steps.map((text, i) => (
            <Step
              key={i}
              index={i + 1}
              text={text}
              isLast={i === steps.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: COLORS.white }}
      >
        <View
          className="px-5 pb-3 pt-3"
          style={{ borderTopWidth: 1, borderColor: COLORS.border }}
        >
          <TouchableOpacity
            onPress={handleGoBackToConfirm}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-2xl py-3.5"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
          >
            <Feather name="repeat" size={15} color={COLORS.textSecondary} />
            <Text
              className="font-semibold text-[13.5px] ml-2"
              style={{ color: COLORS.textSecondary }}
            >
              Đổi phương thức thanh toán khác
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Step({
  index,
  text,
  isLast,
}: {
  index: number;
  text: string;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center"
      style={{ marginBottom: isLast ? 0 : 12 }}
    >
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: COLORS.primaryLight }}
      >
        <Text
          className="text-[11px] font-extrabold"
          style={{ color: COLORS.primary }}
        >
          {index}
        </Text>
      </View>
      <Text
        className="text-[13px] flex-1"
        style={{ color: COLORS.textSecondary }}
      >
        {text}
      </Text>
    </View>
  );
}
