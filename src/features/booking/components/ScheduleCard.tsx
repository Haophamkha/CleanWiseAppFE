import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Card } from "@/components/ui/Card";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

function getLocalizedWeekdays(translateText = defaultTranslate) {
  return [
    translateText("Chủ nhật"),
    translateText("Thứ hai"),
    translateText("Thứ ba"),
    translateText("Thứ tư"),
    translateText("Thứ năm"),
    translateText("Thứ sáu"),
    translateText("Thứ bảy"),
  ];
}
const pad = (n: number) => String(n).padStart(2, "0");
const fmtTime = (d: Date, translateText = defaultTranslate) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function formatDuration(mins: number, translateText = defaultTranslate) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return translateText("{{value0}} giờ {{value1}} phút", { value0: h, value1: m });
  if (h) return translateText("{{value0}} giờ", { value0: h });
  return translateText("{{value0}} phút", { value0: m });
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
            {getLocalizedWeekdays(t)[s.getDay()]}
          </Text>

          <View className="flex-row items-center mt-2 self-start rounded-full bg-canvas px-3 py-1.5">
            <Feather name="clock" size={13} color={COLORS.primaryDark} />
            <Text className="text-ink text-[14px] font-bold ml-1.5">
              {fmtTime(s, t)} – {fmtTime(e, t)}
            </Text>
          </View>

          <Text className="text-ink-muted text-[12.5px] mt-2">
            {t("Thời lượng dự kiến")}{" "}{formatDuration(duration, t)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
