import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { formatDateTime } from "../../types/bookingStatus";

export function ScheduleCard({ start, end }: { start: string; end: string }) {
  return (
    <View
      className="rounded-2xl p-4 mb-5 flex-row items-center"
      style={{
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primaryBorder,
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <Feather name="calendar" size={17} color={COLORS.primary} />
      </View>

      <View className="flex-1">
        <Text className="text-[12px]" style={{ color: COLORS.textSecondary }}>
          Lịch làm việc
        </Text>

        <View className="flex-row items-center flex-wrap mt-1">
          <Text
            className="text-[14px] font-semibold"
            style={{ color: COLORS.primary }}
          >
            {formatDateTime(start)}
          </Text>
          <Text
            className="text-[12px] mx-1"
            style={{ color: COLORS.textSecondary }}
          >
            →
          </Text>
          <Text className="text-[13px]" style={{ color: COLORS.textSecondary }}>
            {formatDateTime(end)}
          </Text>
        </View>
      </View>
    </View>
  );
}
