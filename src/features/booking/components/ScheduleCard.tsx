import { useTranslation } from "react-i18next";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Card } from "@/components/ui/Card";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

function getLocalizedWeekdays() {
  return [
    t("Chủ nhật"),
    t("Thứ hai"),
    t("Thứ ba"),
    t("Thứ tư"),
    t("Thứ năm"),
    t("Thứ sáu"),
    t("Thứ bảy"),
  ];
}
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return t("{{value0}} giờ {{value1}} phút", { value0: h, value1: m });
  if (h) return t("{{value0}} giờ", { value0: h });
  return t("{{value0}} phút", { value0: m });
}

export function ScheduleCard({ start, end }: { start: string; end: string }) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const s = new Date(start);
  const e = new Date(end);
  const duration = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000));

  return (
    <Card className="mb-4 rounded-3xl">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center mr-2">
          <Feather name="calendar" size={15} color={COLORS.primaryDark} />
        </View>
        <Text className="text-ink font-bold text-[15px]">{t("Lịch làm việc")}</Text>
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
            {t("Tháng")}{" "}{s.getMonth() + 1}
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
            {getLocalizedWeekdays()[s.getDay()]}
          </Text>

          <View className="flex-row items-center mt-2 self-start rounded-full bg-canvas px-3 py-1.5">
            <Feather name="clock" size={13} color={COLORS.primaryDark} />
            <Text className="text-ink text-[14px] font-bold ml-1.5">
              {fmtTime(s)} – {fmtTime(e)}
            </Text>
          </View>

          <Text className="text-ink-muted text-[12.5px] mt-2">
            {t("Thời lượng dự kiến")}{" "}{formatDuration(duration)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
