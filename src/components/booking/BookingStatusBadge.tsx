import { BOOKING_STATUS_META } from "@/utils/bookingStatus";
import { Text, View } from "react-native";

interface BookingStatusBadgeProps {
  status: string;
}

export default function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const meta = BOOKING_STATUS_META[
    status as keyof typeof BOOKING_STATUS_META
  ] ?? {
    label: status,
    color: "#374151",
    bg: "#F3F4F6",
  };

  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: meta.bg }}
    >
      <Text className="text-xs font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </Text>
    </View>
  );
}
