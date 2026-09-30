import { Card } from "@/components/ui/Card";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} giờ ${m} phút`;
  if (h) return `${h} giờ`;
  return `${m} phút`;
}

export function ScheduleCard({ start, end }: { start: string; end: string }) {
  const s = new Date(start);
  const e = new Date(end);
  const duration = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000));

  return (
    <Card className="mb-4 rounded-3xl">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center mr-2">
          <Feather name="calendar" size={15} color={COLORS.primaryDark} />
        </View>
        <Text className="text-ink font-bold text-[15px]">Lịch làm việc</Text>
      </View>

      <View className="flex-row items-stretch">
        <View
          className="rounded-2xl bg-primary-light items-center justify-center mr-4"
          style={{ width: 80, paddingVertical: 12 }}
        >
          <Text
            className="text-[11px] font-bold uppercase text-primary-dark"
            style={{ letterSpacing: 1 }}
          >
            Tháng {s.getMonth() + 1}
          </Text>
          <Text
            className="text-[34px] font-extrabold text-primary-dark"
            style={{ lineHeight: 40 }}
          >
            {pad(s.getDate())}
          </Text>
          <Text className="text-[11px] text-ink-soft">{s.getFullYear()}</Text>
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-ink font-bold text-[16px]">
            {WEEKDAYS[s.getDay()]}
          </Text>

          <View className="flex-row items-center mt-2 self-start rounded-full bg-canvas px-3 py-1.5">
            <Feather name="clock" size={13} color={COLORS.primaryDark} />
            <Text className="text-ink text-[14px] font-bold ml-1.5">
              {fmtTime(s)} – {fmtTime(e)}
            </Text>
          </View>

          <Text className="text-ink-muted text-[12.5px] mt-2">
            Thời lượng dự kiến {formatDuration(duration)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
