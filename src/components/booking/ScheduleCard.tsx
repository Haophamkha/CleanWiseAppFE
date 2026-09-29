import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { formatDateTime } from "../../types/bookingStatus";

export function ScheduleCard({ start, end }: { start: string; end: string }) {
  return (
    <View
      className="bg-primary p-4 mb-5"
      style={[{ borderRadius: RADIUS.card }, SHADOWS.float]}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-2.5">
          <Feather name="calendar" size={17} color={COLORS.white} />
        </View>
        <Text className="text-white/85 text-[13px] font-semibold">
          Lịch làm việc
        </Text>
      </View>

      <View className="flex-row items-center rounded-2xl bg-white/15 px-3 py-3">
        <View className="flex-1">
          <Text className="text-white/70 text-[11px] mb-0.5">Bắt đầu</Text>
          <Text className="text-white text-[14px] font-bold">
            {formatDateTime(start)}
          </Text>
        </View>
        <Feather name="arrow-right" size={16} color={COLORS.white} />
        <View className="flex-1 items-end">
          <Text className="text-white/70 text-[11px] mb-0.5">Kết thúc</Text>
          <Text className="text-white text-[14px] font-bold">
            {formatDateTime(end)}
          </Text>
        </View>
      </View>
    </View>
  );
}
