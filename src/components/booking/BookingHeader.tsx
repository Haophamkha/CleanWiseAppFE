import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { getBookingStatusMeta } from "../../types/bookingStatus";

export function BookingHeader({
  serviceName,
  bookingCode,
  status,
}: {
  serviceName: string;
  bookingCode: string;
  status: string;
}) {
  const statusMeta = getBookingStatusMeta(status);

  return (
    <View className="px-5 pt-14 pb-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
          hitSlop={8}
        >
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>

        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {serviceName}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-3 pl-[38px]">
        <Text className="text-gray-500 text-[13px]">#{bookingCode}</Text>

        <View
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: statusMeta.bg }}
        >
          <Text
            className="text-[11px] font-bold"
            style={{ color: statusMeta.color }}
          >
            {statusMeta.label}
          </Text>
        </View>
      </View>
    </View>
  );
}
