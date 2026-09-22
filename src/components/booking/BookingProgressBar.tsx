import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PROGRESS_STEPS, STATUS_INDEX } from "../../types/bookingStatus";

function TerminalBanner({ status }: { status: "CANCELLED" | "EXPIRED" }) {
  const cancelled = status === "CANCELLED";

  return (
    <View
      className="rounded-2xl p-4 mb-5 flex-row items-center"
      style={{
        backgroundColor: cancelled ? "#FEF2F2" : "#FFF7ED",
        borderWidth: 1,
        borderColor: cancelled ? "#FECACA" : "#FED7AA",
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: cancelled ? "#FEE2E2" : "#FFEDD5" }}
      >
        <Feather
          name={cancelled ? "x-circle" : "clock"}
          size={20}
          color={cancelled ? "#DC2626" : "#C2410C"}
        />
      </View>

      <View className="flex-1">
        <Text
          className="font-bold text-[15px]"
          style={{ color: cancelled ? "#B91C1C" : "#C2410C" }}
        >
          {cancelled ? "Đơn hàng đã hủy" : "Đơn hàng đã hết hạn"}
        </Text>
        <Text
          className="text-[13px] mt-1"
          style={{ color: cancelled ? "#991B1B" : "#9A3412" }}
        >
          {cancelled
            ? "Đơn hàng này không còn được xử lý."
            : "Đơn hàng đã hết thời gian chờ nhận việc."}
        </Text>
      </View>
    </View>
  );
}

export function BookingProgressBar({ status }: { status: string }) {
  if (status === "CANCELLED" || status === "EXPIRED") {
    return <TerminalBanner status={status} />;
  }

  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <View
      className="rounded-2xl p-4 mb-5"
      style={{
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <Text className="font-bold text-[15px] text-gray-900 mb-5">
        Tiến độ đơn hàng
      </Text>

      <View className="flex-row items-center">
        {PROGRESS_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const isLast = index === PROGRESS_STEPS.length - 1;

          return (
            <View
              key={step.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: isLast ? 0 : 1,
              }}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor:
                    completed || active ? COLORS.primary : "#E5E7EB",
                }}
              >
                <Feather
                  name={completed ? "check" : step.icon}
                  size={14}
                  color={completed || active ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>

              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    marginHorizontal: 2,
                    backgroundColor:
                      index < currentIndex ? COLORS.primary : "#E5E7EB",
                  }}
                />
              )}
            </View>
          );
        })}
      </View>

      <View className="flex-row mt-2">
        {PROGRESS_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <View
              key={step.key}
              style={{
                flex: 1,
                alignItems:
                  index === 0
                    ? "flex-start"
                    : index === PROGRESS_STEPS.length - 1
                      ? "flex-end"
                      : "center",
              }}
            >
              <Text
                className="text-[10.5px]"
                style={{
                  color: completed || active ? COLORS.primary : "#9CA3AF",
                  fontWeight: active ? "700" : "500",
                }}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
