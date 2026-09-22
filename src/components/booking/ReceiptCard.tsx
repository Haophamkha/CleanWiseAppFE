import { COLORS } from "@/components/service/formFieldShared";
import type { BookingDetail } from "@/types/Booking";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { getPaymentStatusMeta } from "../../types/bookingStatus";

function LineRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "muted" | "bold" | "total";
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text
        className="text-[13px]"
        style={{
          color: emphasis === "total" ? COLORS.text : COLORS.textMuted,
          fontWeight: emphasis === "total" ? "700" : "400",
        }}
      >
        {label}
      </Text>
      <Text
        className={emphasis === "total" ? "text-[17px]" : "text-[13px]"}
        style={{
          color: emphasis === "total" ? COLORS.primary : COLORS.text,
          fontWeight: emphasis === "total" ? "800" : "600",
        }}
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
    <View
      className="rounded-2xl p-4 mb-5"
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Header: method + payment status pill */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center mr-3">
            <Feather name="credit-card" size={17} color={COLORS.primary} />
          </View>
          <View>
            <Text
              className="font-bold text-[15px]"
              style={{ color: COLORS.text }}
            >
              Thanh toán
            </Text>
            <Text
              className="text-[12px] mt-0.5"
              style={{ color: COLORS.textMuted }}
            >
              {methodLabel}
            </Text>
          </View>
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

      {payment?.method === "BANK_TRANSFER" && (
        <View
          className="rounded-2xl items-center justify-center mt-3"
          style={{
            height: 170,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "#D1D5DB",
            backgroundColor: "#F9FAFB",
          }}
        >
          <Feather name="maximize" size={30} color="#9CA3AF" />
          <Text className="font-semibold text-[13px] text-gray-500 mt-3">
            QR thanh toán
          </Text>
          <Text className="text-[11px] text-gray-400 mt-1">
            QR sẽ được tích hợp sau
          </Text>
        </View>
      )}

      {!!payment?.failure_reason && (
        <View className="mt-3 rounded-xl bg-red-50 p-3">
          <Text className="text-[12px] text-red-700">
            {payment.failure_reason}
          </Text>
        </View>
      )}

      {/* Cost breakdown — the ONLY place the total amount is shown */}
      <View
        className="mt-4 pt-3"
        style={{ borderTopWidth: 1, borderColor: COLORS.border }}
      >
        <LineRow
          label="Giá dịch vụ"
          value={
            booking.subtotal_amount
              ? formatVnd(Number(booking.subtotal_amount))
              : "Chờ báo giá"
          }
        />

        {discount > 0 && (
          <LineRow label="Giảm giá" value={`-${formatVnd(discount)}`} />
        )}

        <View
          className="mt-2 pt-3"
          style={{ borderTopWidth: 1, borderColor: COLORS.border }}
        >
          <LineRow
            label="Tổng thanh toán"
            value={
              booking.total_amount
                ? formatVnd(Number(booking.total_amount))
                : "Chờ báo giá"
            }
            emphasis="total"
          />
        </View>
      </View>
    </View>
  );
}
