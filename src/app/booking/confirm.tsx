import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { AddressSummaryCard } from "@/features/booking/components/AddressSummaryCard";
import { IconRow } from "@/features/booking/components/IconRow";
import { PaymentMethodSheet } from "@/features/booking/components/PaymentMethodSheet";
import { ServiceOptionsSummary } from "@/features/booking/components/ServiceOptionsSummary";

import { useBookingConfirm } from "@/features/booking/hooks/useBookingConfirm";
import { BookingVoucherModal } from "@/features/voucher/components/BookingVoucherModal";
import { formatVnd } from "@/utils/currency";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Heading = ({ children }: { children: string }) => (
  <Text className="font-bold text-base text-ink mb-3">{children}</Text>
);

const Dashed = () => (
  <View
    className="border-line"
    style={{ borderTopWidth: 1, borderStyle: "dashed" }}
  />
);

const PriceRow = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <View className="flex-row items-center justify-between mb-2.5">
    <Text className="text-ink-soft">{label}</Text>
    <Text className={`font-bold ${accent ? "text-primary" : "text-ink"}`}>
      {value}
    </Text>
  </View>
);

export default function BookingConfirmScreen() {
  const insets = useSafeAreaInsets();
  const {
    service,
    values,
    isLoading,
    isMovingService,
    pickupAddress,
    deliveryAddress,
    scheduleRows,
    summaryFields,
    recurringPrice,
    estimatedPrice,
    grossPrice,
    discountAmount,
    voucherDiscount,
    totalAmount,
    selectedVoucher,
    voucherValidation,
    voucherModalVisible,
    setVoucherModalVisible,
    applyVoucher,
    clearSelectedVoucher,
    paymentMethod,
    setPaymentMethod,
    selectedPaymentMethod,
    paymentModalVisible,
    setPaymentModalVisible,
    confirm,
    paymentOptions,
  } = useBookingConfirm();

  if (!service) {
    return (
      <View className="flex-1 justify-center bg-canvas">
        <EmptyState
          icon="alert-circle"
          title="Không có thông tin đặt lịch"
          actionLabel="Quay lại"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Xác nhận và thanh toán" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        {/* Hóa đơn */}
        <View
          className="bg-surface border border-line overflow-hidden"
          style={[{ borderRadius: RADIUS.card + 4 }, SHADOWS.card]}
        >
          <View className="px-5 pt-5 pb-4">
            <Heading>Thời gian làm việc</Heading>
            {scheduleRows.map((row, i) => (
              <IconRow
                key={i}
                icon={row.icon}
                text={row.text}
                error={row.error}
                isLast={i === scheduleRows.length - 1}
              />
            ))}
          </View>

          <Dashed />

          <View className="px-5 pt-4 pb-4">
            <Heading>Chi tiết công việc</Heading>
            <ServiceOptionsSummary
              fields={summaryFields}
              values={values}
              pricingConfig={service.pricing_config}
            />
          </View>

          <Dashed />

          <View className="px-5 pt-4 pb-5">
            <Heading>Chi tiết thanh toán</Heading>

            <PriceRow
              label={`Giá dịch vụ${
                recurringPrice ? ` (${recurringPrice.sessionsCount} buổi)` : ""
              }`}
              value={grossPrice != null ? formatVnd(grossPrice) : "—"}
            />
            <PriceRow
              label={`Giảm giá${
                recurringPrice && recurringPrice.discountPercent > 0
                  ? ` (${recurringPrice.discountPercent}%)`
                  : ""
              }`}
              value={
                discountAmount > 0 ? `-${formatVnd(discountAmount)}` : "0đ"
              }
              accent={discountAmount > 0}
            />

            <View className="flex-row items-center justify-between border-t border-line pt-3 mt-1 mb-4">
              <Text className="font-bold text-ink-soft">Tổng thanh toán</Text>
              <Text className="font-extrabold text-xl text-primary">
                {totalAmount != null ? formatVnd(totalAmount) : "—"}
              </Text>
            </View>

            {selectedVoucher && voucherValidation ? (
              <View className="rounded-2xl bg-primary px-4 py-3.5">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                    <Feather name="tag" size={18} color={COLORS.white} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-white font-extrabold text-sm"
                      numberOfLines={1}
                    >
                      {selectedVoucher.voucher.code}
                    </Text>
                    <Text
                      className="text-white/80 text-xs mt-0.5"
                      numberOfLines={1}
                    >
                      {selectedVoucher.voucher.name} · Giảm{" "}
                      {formatVnd(voucherDiscount)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row mt-3 pt-3 border-t border-white/20">
                  <TouchableOpacity
                    className="flex-1 items-center py-1"
                    onPress={() => setVoucherModalVisible(true)}
                  >
                    <Text className="text-white font-bold text-xs">
                      Đổi voucher
                    </Text>
                  </TouchableOpacity>
                  <View className="w-px bg-white/20" />
                  <TouchableOpacity
                    className="flex-1 items-center py-1"
                    onPress={clearSelectedVoucher}
                  >
                    <Text className="text-white font-bold text-xs">
                      Bỏ voucher
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setVoucherModalVisible(true)}
                disabled={estimatedPrice == null}
                activeOpacity={0.8}
                className="flex-row items-center rounded-2xl border border-dashed border-primary-border bg-primary-soft px-4 py-3.5"
                style={{ opacity: estimatedPrice == null ? 0.55 : 1 }}
              >
                <View className="w-10 h-10 rounded-xl bg-primary-light items-center justify-center mr-3">
                  <Feather name="tag" size={18} color={COLORS.primaryDark} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[14px] text-primary-dark">
                    Thêm voucher
                  </Text>
                  <Text className="text-ink-muted text-[11px] mt-0.5">
                    {estimatedPrice == null
                      ? "Khả dụng sau khi dịch vụ có giá"
                      : "Chọn mã giảm giá của bạn"}
                  </Text>
                </View>
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Feather name="plus" size={15} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Địa chỉ */}
        <View className="mt-6">
          <Text className="font-bold text-base text-ink mb-2">
            {isMovingService ? "Địa chỉ chuyển đi" : "Địa chỉ"}
          </Text>
          {pickupAddress ? (
            <AddressSummaryCard address={pickupAddress} />
          ) : (
            <Text className="text-danger">Chưa chọn địa chỉ</Text>
          )}
        </View>

        {isMovingService && (
          <View className="mt-6">
            <Text className="font-bold text-base text-ink mb-2">
              Địa chỉ chuyển đến
            </Text>
            {deliveryAddress ? (
              <AddressSummaryCard address={deliveryAddress} />
            ) : (
              <Text className="text-danger">Chưa chọn địa chỉ</Text>
            )}
          </View>
        )}

        {/* Phương thức thanh toán */}
        <View className="mt-6">
          <Text className="font-bold text-base text-ink mb-2">
            Phương thức thanh toán
          </Text>
          <TouchableOpacity
            onPress={() => setPaymentModalVisible(true)}
            activeOpacity={0.8}
            className="flex-row items-center rounded-2xl border border-line bg-surface p-4"
            style={SHADOWS.card}
          >
            <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center mr-3">
              <MaterialCommunityIcons
                name={selectedPaymentMethod.icon as any}
                size={20}
                color={COLORS.primaryDark}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink">
                {selectedPaymentMethod.label}
              </Text>
              {!!selectedPaymentMethod.subtitle && (
                <Text className="text-ink-muted text-xs mt-0.5">
                  {selectedPaymentMethod.subtitle}
                </Text>
              )}
            </View>
            <Text className="text-xs font-semibold text-primary mr-1">Đổi</Text>
            <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Thanh dưới */}
      <View
        className="bg-surface border-t border-line px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-ink-soft text-sm">Tổng tiền</Text>
          <Text className="text-primary font-extrabold text-xl">
            {totalAmount != null ? formatVnd(totalAmount) : "Chờ báo giá"}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-2xl h-14 items-center justify-center"
          style={[SHADOWS.float, { opacity: isLoading ? 0.6 : 1 }]}
          disabled={isLoading}
          activeOpacity={0.85}
          onPress={confirm}
        >
          <Text className="text-white font-bold text-base">
            {isLoading ? "Đang đăng việc..." : "Đăng việc"}
          </Text>
        </TouchableOpacity>
      </View>

      <BookingVoucherModal
        visible={voucherModalVisible}
        subtotalAmount={estimatedPrice ?? 0}
        selectedVoucherId={selectedVoucher?.id}
        onClose={() => setVoucherModalVisible(false)}
        onApplied={applyVoucher}
        onClear={clearSelectedVoucher}
      />

      <PaymentMethodSheet
        visible={paymentModalVisible}
        value={paymentMethod}
        options={paymentOptions}
        onSelect={(v) => {
          setPaymentMethod(v);
          setPaymentModalVisible(false);
        }}
        onClose={() => setPaymentModalVisible(false)}
      />
    </View>
  );
}
