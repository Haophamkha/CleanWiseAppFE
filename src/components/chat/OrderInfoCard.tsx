import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { ChatBookingSummary } from "@/types/Message";
import { formatScheduleRange } from "@/utils/formatTime";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface OrderInfoCardProps {
  booking: ChatBookingSummary;
}

export default function OrderInfoCard({ booking }: OrderInfoCardProps) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mx-5 mt-4 mb-2"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-500 text-sm">
          Đơn {booking.booking_code}
        </Text>
        <BookingStatusBadge status={booking.status} />
      </View>

      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
          <MaterialCommunityIcons name="broom" size={20} color="#047857" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base">
            {booking.service_name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={13} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">
              {formatScheduleRange(
                booking.scheduled_start,
                booking.scheduled_end,
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
