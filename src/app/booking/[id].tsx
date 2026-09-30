import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLORS } from "@/constants/theme";
import { BookingBottomBar } from "@/features/booking/components/BookingBottomBar";
import { BookingCodeCard } from "@/features/booking/components/BookingCodeCard";
import { BookingHeader } from "@/features/booking/components/BookingHeader";
import { BookingProgressBar } from "@/features/booking/components/BookingProgressBar";
import { CancelBookingModal } from "@/features/booking/components/CancelBookingModal";
import { PackageScheduleSection } from "@/features/booking/components/PackageScheduleSection";
import { ReceiptCard } from "@/features/booking/components/ReceiptCard";
import { ScheduleCard } from "@/features/booking/components/ScheduleCard";
import { SectionTitle } from "@/features/booking/components/SectionTitle";
import { ServiceOptionsSummary } from "@/features/booking/components/ServiceOptionsSummary";
import { SingleScheduleSection } from "@/features/booking/components/SingleScheduleSection";
import { useBookingDetail } from "@/features/booking/hooks/useBookingDetail";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BookingData = NonNullable<ReturnType<typeof useBookingDetail>["booking"]>;

function AddressBlock({
  title,
  address,
  fallbackLabel,
}: {
  title: string;
  address: BookingData["address"];
  fallbackLabel: string;
}) {
  return (
    <Card className="mb-4">
      <SectionTitle icon="map-pin">{title}</SectionTitle>
      <Text className="text-ink font-bold text-[15px] mb-1">
        {address.label || fallbackLabel}
      </Text>
      <Text className="text-ink-soft text-[13px] leading-5 mb-3">
        {address.address_line}
        {address.ward ? `, ${address.ward}` : ""}
        {`, ${address.city}`}
      </Text>
      <View className="flex-row items-center rounded-xl bg-canvas px-3 py-2.5">
        <Feather name="user" size={14} color={COLORS.inkMuted} />
        <Text className="text-ink-soft text-[13px] ml-2 flex-1">
          {address.receiver_name} · {address.receiver_phone}
        </Text>
      </View>
    </Card>
  );
}

export default function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    booking,
    isLoading,
    isError,
    isPackage,
    singleSchedule,
    isCancellable,
    isPaidOnline,
    cancelVisible,
    setCancelVisible,
    isCancelling,
    confirmCancel,
  } = useBookingDetail();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View className="flex-1 justify-center bg-canvas">
        <EmptyState
          icon="alert-circle"
          title="Không tải được đơn hàng"
          actionLabel="Quay lại"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <BookingHeader
        serviceName={booking.service_name}
        status={booking.status}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: isCancellable ? 24 : 24 + insets.bottom,
        }}
      >
        <BookingCodeCard code={booking.booking_code} large />

        <BookingProgressBar status={booking.status} />

        {isPackage ? (
          <PackageScheduleSection
            schedules={booking.schedules}
            bookingId={booking.id}
            bookingStatus={booking.status}
          />
        ) : (
          <>
            {singleSchedule && (
              <ScheduleCard
                start={singleSchedule.scheduled_start}
                end={singleSchedule.scheduled_end}
              />
            )}
            {singleSchedule && (
              <SingleScheduleSection schedule={singleSchedule} />
            )}
          </>
        )}

        <AddressBlock
          title={booking.delivery_address ? "Địa chỉ chuyển đi" : "Địa chỉ"}
          address={booking.address}
          fallbackLabel="Địa chỉ thực hiện dịch vụ"
        />

        {booking.delivery_address && (
          <AddressBlock
            title="Địa chỉ chuyển đến"
            address={booking.delivery_address}
            fallbackLabel="Địa chỉ chuyển đến"
          />
        )}

        <Card className="mb-4">
          <SectionTitle icon="clipboard">Chi tiết dịch vụ</SectionTitle>
          <ServiceOptionsSummary
            fields={booking.form_schema?.fields ?? []}
            values={booking.service_data}
            pricingConfig={booking.pricing_config}
          />
        </Card>

        <ReceiptCard booking={booking} />

        {!!booking.note && (
          <Card className="mt-4">
            <SectionTitle icon="file-text">Ghi chú</SectionTitle>
            <Text className="text-[14px] leading-5 text-ink-soft">
              {booking.note}
            </Text>
          </Card>
        )}
      </ScrollView>

      {isCancellable && (
        <BookingBottomBar onCancel={() => setCancelVisible(true)} />
      )}

      <CancelBookingModal
        visible={cancelVisible}
        loading={isCancelling}
        isPaidOnline={isPaidOnline}
        onClose={() => setCancelVisible(false)}
        onConfirm={confirmCancel}
      />
    </View>
  );
}
