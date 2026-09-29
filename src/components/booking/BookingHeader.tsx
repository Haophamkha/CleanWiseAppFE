import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const statusMeta = getBookingStatusMeta(status);

  return (
    <View
      className="bg-surface border-b border-line px-5 pb-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-canvas items-center justify-center mr-3"
        >
          <Feather name="arrow-left" size={20} color={COLORS.ink} />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-lg font-bold text-ink" numberOfLines={1}>
            {serviceName}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Feather name="hash" size={12} color={COLORS.inkMuted} />
            <Text
              className="text-ink-muted text-[13px] ml-0.5"
              numberOfLines={1}
            >
              {bookingCode}
            </Text>
          </View>
        </View>

        <View
          className="px-3 py-1.5 rounded-full ml-2"
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
