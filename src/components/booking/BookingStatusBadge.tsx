import { getBookingStatusMeta } from "@/utils/bookingStatus";
import { Text, View } from "react-native";

interface BookingStatusBadgeProps {
  status: string;
}

export default function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  const meta = getBookingStatusMeta(status);

  return (
    <View className={`rounded-full px-3 py-1 ${meta.bgClass}`}>
      <Text className={`text-xs font-semibold ${meta.textClass}`}>
        {meta.label}
      </Text>
    </View>
  );
}
