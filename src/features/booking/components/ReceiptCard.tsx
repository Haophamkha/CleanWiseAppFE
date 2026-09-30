import { Card } from "@/components/ui/Card";
import { COLORS } from "@/constants/theme";
import type { BookingDetail } from "@/features/booking/types/Booking";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { getPaymentStatusMeta } from "../types/bookingStatus";

function LineRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-[13px] text-ink-soft">{label}</Text>
      <Text
        className={`text-[13px] font-semibold ${
          accent ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

export function ReceiptCard({ booking }: { booking: BookingDetail }) {
  const payment = booking.payment;
  const paymentStatus = getPaymentStatusMeta(booking.payment_status);
  const discount = Number(booking.discount_amount);

  const methodLabel =
    payment?.method_display ??
    (payment?.method === "BANK_TRANSFER"
      ? "Chuyển khoản"
      : payment?.method === "CASH"
        ? "Tiền mặt"
        : "Chưa xác định");

  return (
    <Card className="mb-5 rounded-3xl">
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full bg-primary-light items-center justify-center mr-3">
          <Feather name="credit-card" size={19} color={COLORS.primaryDark} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-[15px] text-ink">Thanh toán</Text>
          <Text className="text-[12px] mt-0.5 text-ink-muted">
            {methodLabel}
          </Text>
        </View>
        <View
          className="px-2.5 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: paymentStatus.bg }}
        >
          <Feather
            name={paymentStatus.icon}
            size={12}
            color={paymentStatus.color}
          />
          <Text
            className="text-[11px] font-bold ml-1"
            style={{ color: paymentStatus.color }}
          >
            {paymentStatus.label}
          </Text>
        </View>
      </View>

      {!!payment?.failure_reason && (
        <View className="mt-3 flex-row items-start rounded-xl bg-danger-light p-3">
          <Feather
            name="alert-circle"
            size={14}
            color={COLORS.danger}
            style={{ marginTop: 1, marginRight: 8 }}
          />
          <Text className="flex-1 text-[12px] text-danger">
            {payment.failure_reason}
          </Text>
        </View>
      )}

      <View className="mt-4 pt-3 border-t border-dashed border-line">
        <LineRow
          label="Giá dịch vụ"
          value={
            booking.subtotal_amount
              ? formatVnd(Number(booking.subtotal_amount))
              : "Chờ báo giá"
          }
        />
        {discount > 0 && (
          <LineRow label="Giảm giá" value={`-${formatVnd(discount)}`} accent />
        )}
      </View>

      <View className="flex-row items-center justify-between rounded-2xl bg-primary-soft border border-primary-border px-4 py-3 mt-3">
        <Text className="font-bold text-[14px] text-ink">Tổng thanh toán</Text>
        <Text className="font-extrabold text-xl text-primary">
          {booking.total_amount
            ? formatVnd(Number(booking.total_amount))
            : "Chờ báo giá"}
        </Text>
      </View>
    </Card>
  );
}
