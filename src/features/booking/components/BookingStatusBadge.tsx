import { useAppTheme } from "@/features/theme/ThemeProvider";
import { getBookingStatusMap } from "@/features/booking/utils/bookingStatus";
import { Text, View } from "react-native";

interface BookingStatusBadgeProps {
  status: string;
}

export default function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const { COLORS } = useAppTheme();

  const BOOKING_STATUS_META = getBookingStatusMap(COLORS);

  const meta = BOOKING_STATUS_META[
    status as keyof typeof BOOKING_STATUS_META
  ] ?? {
    label: status,
    color: COLORS.inkSoft,
    bg: COLORS.surfaceMuted,
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
