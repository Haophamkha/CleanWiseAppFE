import { AddressSummaryCard } from "@/components/booking/AddressSummaryCard";
import { ServiceOptionsSummary } from "@/components/booking/ServiceOptionsSummary";
import { COLORS } from "@/components/service/formFieldShared";
import { ROUTES } from "@/config/constants";
import { useCreateBookingMutation } from "@/services/bookingApi";
import { clearBookingDraft } from "@/store/bookingDraftSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatVnd } from "@/utils/currency";
import { calculateEstimatedPrice } from "@/utils/servicePricing";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod = "CASH" | "BANK_TRANSFER";

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: string;
}[] = [
  { value: "CASH", label: "Tiền mặt", icon: "cash" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản", icon: "bank" },
];

// ĐỔI: label hiển thị cho weekdays / package_duration của dịch vụ định kỳ.
const WEEKDAY_LABELS: Record<string, string> = {
  MON: "T2",
  TUE: "T3",
  WED: "T4",
  THU: "T5",
  FRI: "T6",
  SAT: "T7",
  SUN: "CN",
};

const PACKAGE_LABELS: Record<string, string> = {
  "1_MONTH": "1 tháng",
  "2_MONTHS": "2 tháng",
  "3_MONTHS": "3 tháng",
  "6_MONTHS": "6 tháng",
};

function extractDurationHours(
  fields: { key: string; type: string }[],
  values: Record<string, any>,
): number {
  const durationField = fields.find(
    (f) => f.key === "duration" && f.type === "SINGLE_SELECT",
  );
  const raw = durationField ? values[durationField.key] : undefined;
  if (typeof raw === "string") {
    const match = raw.match(/^(\d+)_HOURS?$/i);
    if (match) return parseInt(match[1], 10);
  }
  return 2;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ĐỔI: format danh sách thứ trong tuần cho dịch vụ định kỳ.
function formatWeekdays(weekdays: string[] | undefined): string {
  if (!weekdays || weekdays.length === 0) return "—";
  return weekdays.map((d) => WEEKDAY_LABELS[d] ?? d).join(", ");
}

export default function BookingConfirmScreen() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.bookingDraft);
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const { service, values, addresses } = draft;

  // ĐỔI: dịch vụ chuyển nhà cần 2 địa chỉ (pickup_address + delivery_address);
  // các dịch vụ khác chỉ có 1 entry chung (key "address").
  const isMovingService = service?.form_schema.address_count === 2;
  const pickupAddress =
    addresses?.pickup_address ?? Object.values(addresses ?? {})[0];
  const deliveryAddress = addresses?.delivery_address;

  // ĐỔI: loại lịch của dịch vụ — ONCE (mặc định) hoặc RECURRING_WEEKLY.
  // BE tự tính danh sách buổi làm việc cụ thể từ service_data theo loại này,
  // FE chỉ cần biết loại để hiển thị + validate đúng field bắt buộc.
  const scheduleType: string = service?.form_schema.schedule_type ?? "ONCE";

  const estimatedPrice = useMemo(() => {
    if (!service) return null;
    return calculateEstimatedPrice(
      service.form_schema.fields,
      service.pricing_config,
      values,
    );
  }, [service, values]);

  // ĐỔI: scheduledStart chỉ có ý nghĩa với lịch ONCE, dùng để hiển thị,
  // không còn dùng để build payload gửi lên (BE tự tính).
  const scheduledStart = useMemo(() => {
    if (scheduleType !== "ONCE") return null;
    const date = values.date; // "YYYY-MM-DD"
    const time = values.start_time; // "HH:MM"
    if (!date || !time) return null;
    const parsed = new Date(`${date}T${time}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [scheduleType, values]);

  const durationHours = useMemo(() => {
    if (!service) return 2;
    return extractDurationHours(service.form_schema.fields, values);
  }, [service, values]);

  const scheduledEnd = useMemo(() => {
    if (!scheduledStart) return null;
    return new Date(scheduledStart.getTime() + durationHours * 60 * 60 * 1000);
  }, [scheduledStart, durationHours]);

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="alert-circle" size={36} color="#DC2626" />
        <Text className="text-gray-900 font-semibold mt-4">
          Không có thông tin đặt lịch
        </Text>
        <TouchableOpacity
          className="mt-5 bg-emerald-700 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const buildServiceData = () => {
    const allowedKeys = new Set(service.form_schema.fields.map((f) => f.key));
    return Object.fromEntries(
      Object.entries(values).filter(([k]) => allowedKeys.has(k)),
    );
  };

  const handleConfirm = async () => {
    if (!pickupAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng quay lại chọn địa chỉ thực hiện dịch vụ.",
      );
      return;
    }

    // ĐỔI: validate thêm địa chỉ chuyển đến cho dịch vụ chuyển nhà.
    if (isMovingService && !deliveryAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng quay lại chọn địa chỉ chuyển đến.",
      );
      return;
    }

    // ĐỔI: validate lịch tách theo loại — ONCE cần date/start_time cụ thể,
    // RECURRING_WEEKLY cần weekdays/start_time/package_duration.
    if (scheduleType === "ONCE") {
      if (!scheduledStart || !scheduledEnd) {
        Alert.alert(
          "Thiếu thông tin",
          "Vui lòng quay lại chọn ngày và giờ làm việc.",
        );
        return;
      }
      if (scheduledStart.getTime() <= Date.now()) {
        Alert.alert("Thời gian không hợp lệ", "Giờ bắt đầu phải ở tương lai.");
        return;
      }
    }

    if (scheduleType === "RECURRING_WEEKLY") {
      if (
        !values.weekdays?.length ||
        !values.start_time ||
        !values.package_duration
      ) {
        Alert.alert(
          "Thiếu thông tin",
          "Vui lòng quay lại chọn lịch làm việc định kỳ.",
        );
        return;
      }
    }

    try {
      const serviceData = buildServiceData();

      const missingFields = service.form_schema.fields
        .filter((field) => {
          const value = serviceData[field.key];

          return (
            field.required === true &&
            (value === undefined || value === null || value === "")
          );
        })
        .map((field) => ({
          key: field.key,
          label: field.label,
          type: field.type,
        }));

      if (missingFields.length > 0) {
        Alert.alert(
          "Thiếu thông tin",
          `Các trường bắt buộc chưa có dữ liệu:\n\n${missingFields
            .map((field) => `• ${field.label} (${field.key})`)
            .join("\n")}`,
        );
        return;
      }

      // =========================
      // BUILD PAYLOAD
      // ĐỔI: bỏ hẳn "schedules" — BE tự sinh từ service_data.
      // Thêm delivery_address_id khi là dịch vụ chuyển nhà.
      // =========================
      const payload = {
        service_id: service.id,
        address_id: pickupAddress.id,
        delivery_address_id: isMovingService ? deliveryAddress?.id : undefined,
        service_data: serviceData,
        payment_method: paymentMethod,
        note:
          typeof values.note === "string" && values.note.trim()
            ? values.note.trim()
            : undefined,
      };

      const result = await createBooking(payload as any).unwrap();

      if (paymentMethod === "BANK_TRANSFER") {
        router.replace({
          pathname: "/booking/qr",
          params: {
            bookingId: String(result.id),
            code: result.booking_code,
          },
        });
      } else {
        dispatch(clearBookingDraft());

        router.replace({
          pathname: "/booking/success",
          params: { code: result.booking_code },
        });
      }
    } catch (err: any) {
      const message =
        err?.data?.errors?.service_data ||
        err?.data?.service_data?.__extra__ ||
        err?.data?.message ||
        (typeof err?.data === "string" ? err.data : null) ||
        "Đặt lịch thất bại, vui lòng thử lại.";

      Alert.alert("Không thể đặt lịch", String(message));
    }
  };

  // ĐỔI: loại thêm weekdays/package_duration khỏi "Chi tiết công việc" vì
  // đã hiển thị riêng ở "Thời gian làm việc" (cùng lý do với date/start_time).
  const summaryFields = service.form_schema.fields.filter(
    (f) =>
      f.key !== "date" &&
      f.key !== "start_time" &&
      f.key !== "weekdays" &&
      f.key !== "package_duration",
  );

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (m) => m.value === paymentMethod,
  )!;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1">
          Xác nhận và thanh toán
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-5">
          {/* Card kiểu hoá đơn: Thời gian làm việc + Chi tiết công việc + Chi tiết thanh toán */}
          <View
            style={{
              borderRadius: 24,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
              elevation: 2,
              overflow: "hidden",
            }}
          >
            <View className="px-5 pt-5 pb-4">
              <Text
                className="font-bold text-[16px] mb-3"
                style={{ color: COLORS.text }}
              >
                Thời gian làm việc
              </Text>

              {/* ĐỔI: tách hiển thị theo scheduleType */}
              {scheduleType === "ONCE" ? (
                <>
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: COLORS.primaryLight }}
                    >
                      <Feather
                        name="calendar"
                        size={16}
                        color={COLORS.primary}
                      />
                    </View>
                    {scheduledStart ? (
                      <Text
                        className="text-[15px]"
                        style={{ color: COLORS.text }}
                      >
                        {capitalizeFirst(
                          scheduledStart.toLocaleDateString("vi-VN", {
                            weekday: "long",
                          }),
                        )}
                        {", "}
                        {scheduledStart.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {scheduledStart.toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Text>
                    ) : (
                      <Text style={{ color: COLORS.danger }}>
                        Chưa chọn ngày/giờ ở trang dịch vụ
                      </Text>
                    )}
                  </View>

                  {scheduledStart && scheduledEnd && (
                    <View className="flex-row items-center">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: COLORS.primaryLight }}
                      >
                        <Feather
                          name="clock"
                          size={16}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text
                        className="text-[15px]"
                        style={{ color: COLORS.text }}
                      >
                        {durationHours} giờ,{" "}
                        {scheduledStart.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        đến{" "}
                        {scheduledEnd.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: COLORS.primaryLight }}
                    >
                      <Feather name="repeat" size={16} color={COLORS.primary} />
                    </View>
                    {values.weekdays?.length && values.start_time ? (
                      <Text
                        className="text-[15px]"
                        style={{ color: COLORS.text }}
                      >
                        {formatWeekdays(values.weekdays)}, {values.start_time}
                      </Text>
                    ) : (
                      <Text style={{ color: COLORS.danger }}>
                        Chưa chọn lịch định kỳ ở trang dịch vụ
                      </Text>
                    )}
                  </View>
                  {values.package_duration && (
                    <View className="flex-row items-center">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: COLORS.primaryLight }}
                      >
                        <Feather
                          name="clock"
                          size={16}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text
                        className="text-[15px]"
                        style={{ color: COLORS.text }}
                      >
                        Gói{" "}
                        {PACKAGE_LABELS[values.package_duration] ??
                          values.package_duration}
                        , bắt đầu từ ngày mai
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.border,
              }}
            />

            <View className="px-5 pt-4 pb-4">
              <Text
                className="font-bold text-[16px] mb-3"
                style={{ color: COLORS.text }}
              >
                Chi tiết công việc
              </Text>
              <ServiceOptionsSummary
                fields={summaryFields}
                values={values}
                pricingConfig={service.pricing_config}
              />
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.border,
              }}
            />

            <View className="px-5 pt-4 pb-5">
              <Text
                className="font-bold text-[16px] mb-3"
                style={{ color: COLORS.text }}
              >
                Chi tiết thanh toán
              </Text>

              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ color: COLORS.textMuted }}>Giá dịch vụ</Text>
                <Text className="font-bold" style={{ color: COLORS.text }}>
                  {estimatedPrice != null ? formatVnd(estimatedPrice) : "—"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: COLORS.textMuted }}>Giảm giá</Text>
                <Text className="font-bold" style={{ color: COLORS.text }}>
                  0 đ
                </Text>
              </View>

              <View
                style={{ borderTopWidth: 1, borderColor: COLORS.border }}
                className="pt-3 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="font-bold"
                    style={{ color: COLORS.textMuted }}
                  >
                    Tổng thanh toán
                  </Text>
                  <Text
                    className="font-extrabold text-[17px]"
                    style={{ color: COLORS.primary }}
                  >
                    {estimatedPrice != null ? formatVnd(estimatedPrice) : "—"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.VOUCHERS as any)}
                activeOpacity={0.8}
                className="flex-row items-center justify-between rounded-2xl px-4 py-3.5"
                style={{
                  backgroundColor: COLORS.primaryLight,
                  borderWidth: 1,
                  borderColor: COLORS.primaryBorder,
                }}
              >
                <Text
                  className="font-bold text-[14px]"
                  style={{ color: COLORS.primary }}
                >
                  Thêm Voucher
                </Text>
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <Feather name="plus" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Địa chỉ — ĐỔI: dùng AddressSummaryCard dùng chung, thêm nhánh chuyển nhà */}
          <View className="mt-6">
            <Text
              className="font-bold text-[16px] mb-2"
              style={{ color: COLORS.text }}
            >
              {isMovingService ? "Địa chỉ chuyển đi" : "Địa chỉ"}
            </Text>
            {pickupAddress ? (
              <AddressSummaryCard address={pickupAddress} />
            ) : (
              <Text style={{ color: COLORS.danger }}>Chưa chọn địa chỉ</Text>
            )}
          </View>

          {isMovingService && (
            <View className="mt-6">
              <Text
                className="font-bold text-[16px] mb-2"
                style={{ color: COLORS.text }}
              >
                Địa chỉ chuyển đến
              </Text>
              {deliveryAddress ? (
                <AddressSummaryCard address={deliveryAddress} />
              ) : (
                <Text style={{ color: COLORS.danger }}>Chưa chọn địa chỉ</Text>
              )}
            </View>
          )}

          {/* Phương thức thanh toán */}
          <View className="mt-6">
            <Text
              className="font-bold text-[16px] mb-2"
              style={{ color: COLORS.text }}
            >
              Phương thức thanh toán
            </Text>
            <TouchableOpacity
              onPress={() => setPaymentModalVisible(true)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4"
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: COLORS.primaryLight }}
                >
                  <MaterialCommunityIcons
                    name={selectedPaymentMethod.icon as any}
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <Text
                  className="text-[15px] font-medium"
                  style={{ color: COLORS.text }}
                >
                  {selectedPaymentMethod.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal chọn phương thức thanh toán */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(17,24,39,0.45)" }}
          activeOpacity={1}
          onPress={() => setPaymentModalVisible(false)}
        >
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingBottom: 28,
              }}
            >
              <View className="items-center pt-3 pb-1">
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: COLORS.border,
                  }}
                />
              </View>
              <Text
                className="text-[16px] font-bold text-center py-3"
                style={{ color: COLORS.text }}
              >
                Phương thức thanh toán
              </Text>

              <View className="px-5">
                {PAYMENT_METHODS.map((m) => {
                  const selected = m.value === paymentMethod;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      onPress={() => {
                        setPaymentMethod(m.value);
                        setPaymentModalVisible(false);
                      }}
                      activeOpacity={0.8}
                      className="flex-row items-center justify-between rounded-2xl px-4 py-4 mb-3"
                      style={{
                        backgroundColor: selected
                          ? COLORS.primaryLight
                          : COLORS.background,
                        borderWidth: selected ? 1 : 0,
                        borderColor: COLORS.primaryBorder,
                      }}
                    >
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name={m.icon as any}
                          size={20}
                          color={
                            selected ? COLORS.primary : COLORS.textSecondary
                          }
                        />
                        <Text
                          className="ml-3 text-[15px] font-medium"
                          style={{
                            color: selected ? COLORS.primary : COLORS.text,
                          }}
                        >
                          {m.label}
                        </Text>
                      </View>
                      {selected && (
                        <Feather
                          name="check"
                          size={18}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SafeAreaView
        edges={["bottom"]}
        className="border-t border-gray-100 bg-white"
      >
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-500 text-sm">Tổng tiền</Text>

            <Text className="text-emerald-700 font-bold text-lg">
              {estimatedPrice != null
                ? formatVnd(estimatedPrice)
                : "Chờ báo giá"}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-4 items-center"
            style={{ opacity: isLoading ? 0.6 : 1 }}
            disabled={isLoading}
            activeOpacity={0.8}
            onPress={handleConfirm}
          >
            <Text className="text-white font-bold text-base">
              {isLoading ? "Đang đăng việc..." : "Đăng việc"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
