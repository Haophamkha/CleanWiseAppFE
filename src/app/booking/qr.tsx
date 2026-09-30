import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { BookingCodeCard } from "@/features/booking/components/BookingCodeCard";
import { useBookingPayment } from "@/features/booking/hooks/useBookingPayment";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  "Nhấn “Mở trang thanh toán”",
  "Chọn ngân hàng hoặc ví điện tử bạn muốn dùng",
  "Xác nhận thanh toán trong app đó",
];

function PulseDot() {
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

  return (
    <Animated.View
      className="w-2 h-2 rounded-full bg-primary mr-2"
      style={{ opacity: pulse }}
    />
  );
}

export default function BookingQrScreen() {
  const insets = useSafeAreaInsets();
  const {
    code,
    link,
    isLoading,
    hasError,
    expired,
    showLink,
    isUrgent,
    countdownText,
    totalText,
    showQr,
    toggleQr,
    opening,
    openCheckout,
    goBackToConfirm,
  } = useBookingPayment();

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Thanh toán đơn hàng" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
      >
        <Card className="mb-4">
          <BookingCodeCard code={code} />
        </Card>

        {/* Thẻ thanh toán chính */}
        <View
          className="bg-surface border border-line overflow-hidden"
          style={[{ borderRadius: RADIUS.hero - 4 }, SHADOWS.float]}
        >
          <View className="bg-primary items-center py-6">
            <Text className="text-white/80 text-xs font-semibold">
              Số tiền cần thanh toán
            </Text>
            <Text className="text-white font-extrabold text-[32px] mt-1">
              {totalText}
            </Text>
          </View>

          <View className="items-center px-5 pt-6 pb-6">
            {isLoading && (
              <View className="h-40 items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text className="text-ink-muted text-[13px] mt-3">
                  Đang tạo link thanh toán...
                </Text>
              </View>
            )}

            {hasError && !isLoading && (
              <View className="h-40 items-center justify-center px-6">
                <View className="w-14 h-14 rounded-full bg-danger-light items-center justify-center mb-3">
                  <Feather
                    name="alert-triangle"
                    size={24}
                    color={COLORS.danger}
                  />
                </View>
                <Text className="text-danger text-center text-[13px] font-medium">
                  Không tạo được link thanh toán, vui lòng thử lại.
                </Text>
              </View>
            )}

            {showLink && (
              <>
                <TouchableOpacity
                  onPress={openCheckout}
                  activeOpacity={0.85}
                  disabled={opening}
                  className="flex-row items-center justify-center w-full h-14 rounded-2xl bg-primary"
                >
                  {opening ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Feather
                        name="external-link"
                        size={18}
                        color={COLORS.white}
                      />
                      <Text className="text-white font-bold ml-2 text-[15px]">
                        Mở trang thanh toán
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text className="text-ink-muted text-xs text-center mt-3 px-2">
                  Bạn có thể chọn ngân hàng hoặc ví điện tử bất kỳ ngay trong
                  trang thanh toán
                </Text>

                <View
                  className={`flex-row items-center mt-4 px-3 py-1.5 rounded-full border ${
                    isUrgent
                      ? "bg-danger border-danger"
                      : "bg-primary-light border-primary-border"
                  }`}
                >
                  <Feather
                    name="clock"
                    size={12}
                    color={isUrgent ? COLORS.white : COLORS.primaryDark}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-bold ${
                      isUrgent ? "text-white" : "text-primary-dark"
                    }`}
                  >
                    Còn {countdownText}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={toggleQr}
                  activeOpacity={0.7}
                  className="flex-row items-center mt-5"
                >
                  <Text className="text-[13px] font-semibold text-ink-soft">
                    {showQr ? "Ẩn mã QR" : "Hoặc quét mã QR"}
                  </Text>
                  <Feather
                    name={showQr ? "chevron-up" : "chevron-down"}
                    size={15}
                    color={COLORS.inkSoft}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {showQr && link?.qr_code && (
                  <View className="mt-4 p-4 rounded-3xl border border-line bg-white">
                    <QRCode value={link.qr_code} size={200} />
                  </View>
                )}

                <View className="w-full items-center border-t border-dashed border-line mt-5 pt-4">
                  <View className="flex-row items-center">
                    <PulseDot />
                    <Text className="text-ink-muted text-[13px]">
                      Đang chờ thanh toán...
                    </Text>
                  </View>
                </View>
              </>
            )}

            {expired && (
              <View className="items-center py-4">
                <View className="w-14 h-14 rounded-full bg-canvas items-center justify-center mb-3">
                  <Feather name="clock" size={24} color={COLORS.inkMuted} />
                </View>
                <Text className="text-ink text-[14px] font-semibold">
                  Link thanh toán đã hết hạn
                </Text>
                <Text className="text-ink-muted text-xs mt-1 mb-4">
                  Đang quay về trang đặt lịch...
                </Text>
                <TouchableOpacity
                  onPress={goBackToConfirm}
                  activeOpacity={0.85}
                  className="flex-row items-center h-11 px-5 rounded-full bg-primary"
                >
                  <Feather name="refresh-cw" size={15} color={COLORS.white} />
                  <Text className="text-white font-bold ml-2 text-[13px]">
                    Đặt lại để lấy link mới
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Hướng dẫn */}
        <Card className="mt-4">
          <Text className="font-bold text-[14px] text-ink mb-3">
            Hướng dẫn thanh toán
          </Text>
          {STEPS.map((text, i) => (
            <View
              key={i}
              className={`flex-row items-center ${
                i === STEPS.length - 1 ? "" : "mb-3"
              }`}
            >
              <View className="w-7 h-7 rounded-full bg-primary-light items-center justify-center mr-3">
                <Text className="text-xs font-extrabold text-primary-dark">
                  {i + 1}
                </Text>
              </View>
              <Text className="flex-1 text-[13px] text-ink-soft">{text}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      <View
        className="bg-surface border-t border-line px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <TouchableOpacity
          onPress={goBackToConfirm}
          activeOpacity={0.8}
          className="flex-row items-center justify-center h-12 rounded-2xl border border-line"
        >
          <Feather name="repeat" size={15} color={COLORS.inkSoft} />
          <Text className="font-semibold text-[14px] text-ink-soft ml-2">
            Đổi phương thức thanh toán khác
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
