import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PROGRESS_STEPS, STATUS_INDEX } from "../types/bookingStatus";

function TerminalBanner({ status }: { status: "CANCELLED" | "EXPIRED" }) {
  const cancelled = status === "CANCELLED";
  const bg = cancelled ? COLORS.dangerLight : COLORS.accentLight;
  const tint = cancelled ? COLORS.danger : COLORS.accentDark;

  return (
    <View
      className="rounded-3xl p-4 mb-5 flex-row items-center"
      style={{ backgroundColor: bg }}
    >
      <View className="w-12 h-12 rounded-full bg-white/70 items-center justify-center mr-3">
        <Feather
          name={cancelled ? "x-circle" : "clock"}
          size={22}
          color={tint}
        />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-[15px]" style={{ color: tint }}>
          {cancelled ? "Đơn hàng đã hủy" : "Đơn hàng đã hết hạn"}
        </Text>
        <Text className="text-[13px] mt-0.5 text-ink-soft">
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
  const total = PROGRESS_STEPS.length;

  return (
    <View
      className="rounded-3xl bg-surface border border-line p-4 mb-5"
      style={SHADOWS.card}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-bold text-[15px] text-ink">Tiến độ đơn hàng</Text>
        <View className="px-2.5 py-1 rounded-full bg-primary-light">
          <Text className="text-[11px] font-bold text-primary-dark">
            Bước {Math.min(currentIndex + 1, total)}/{total}
          </Text>
        </View>
      </View>

      <View className="flex-row">
        {PROGRESS_STEPS.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;
          const reached = completed || active;
          const isFirst = index === 0;
          const isLast = index === total - 1;

          return (
            <View key={step.key} className="flex-1 items-center">
              <View className="flex-row items-center w-full">
                <View
                  className={`flex-1 h-1 rounded-full ${
                    isFirst
                      ? "bg-transparent"
                      : reached
                        ? "bg-primary"
                        : "bg-line"
                  }`}
                />
                <View
                  className={`w-11 h-11 rounded-full items-center justify-center ${
                    active ? "bg-primary-light" : ""
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      reached ? "bg-primary" : "bg-canvas border border-line"
                    }`}
                  >
                    <Feather
                      name={completed ? "check" : step.icon}
                      size={14}
                      color={reached ? COLORS.white : COLORS.inkMuted}
                    />
                  </View>
                </View>
                <View
                  className={`flex-1 h-1 rounded-full ${
                    isLast
                      ? "bg-transparent"
                      : completed
                        ? "bg-primary"
                        : "bg-line"
                  }`}
                />
              </View>

              <Text
                numberOfLines={1}
                className={`mt-1.5 text-[10.5px] ${
                  active
                    ? "font-bold text-primary-dark"
                    : reached
                      ? "font-medium text-primary"
                      : "font-medium text-ink-muted"
                }`}
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
