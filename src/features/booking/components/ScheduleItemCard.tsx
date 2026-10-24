import { useTranslation } from "react-i18next";
import { translate as t, getLocale } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { BookingScheduleDetail } from "@/features/booking/types/Booking";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Worker = NonNullable<BookingScheduleDetail["worker"]>;

const CUSTOMER_MIN_CANCEL_HOURS = 6;

const canCancelSchedule = (startIso: string) =>
  new Date(startIso).getTime() - Date.now() >=
  CUSTOMER_MIN_CANCEL_HOURS * 60 * 60 * 1000;

function getLocalizedWeekdayLabels() {
  return [
    t("Chủ nhật"),
    t("Thứ 2"),
    t("Thứ 3"),
    t("Thứ 4"),
    t("Thứ 5"),
    t("Thứ 6"),
    t("Thứ 7"),
  ];
}

// Khớp với BookingSchedule.Status bên BE (models.py)


function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();
  const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: t("Chờ thực hiện"),
    bg: COLORS.accentLight,
    text: COLORS.accentDark,
  },
  IN_PROGRESS: {
    label: t("Đang làm buổi này"),
    bg: COLORS.infoLight,
    text: COLORS.infoDark,
  },
  COMPLETED: {
    label: t("Đã hoàn thành"),
    bg: COLORS.successLight,
    text: COLORS.success,
  },
  CANCELLED: {
    label: t("Đã hủy"),
    bg: COLORS.dangerLight,
    text: COLORS.danger,
  },
  MISSED: {
    label: t("Không có nhân viên nhận"),
    bg: COLORS.surfaceMuted,
    text: COLORS.inkSoft,
  },
};

  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-[11px] font-bold" style={{ color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
}

function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const weekday = getLocalizedWeekdayLabels()[start.getDay()];
  const dateStr = start.toLocaleDateString(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { weekday, dateStr, startTime, endTime };
}

function WorkerRow({
  worker,
  assignmentId,
}: {
  worker: Worker;
  assignmentId: number | null;
}) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const fullName =
    `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
    t("Nhân viên");

  const content = (
    <View className="flex-row items-center mt-3 pt-3 border-t border-line">
      {worker.avatar ? (
        <Image
          source={{ uri: worker.avatar }}
          className="w-16 h-16 rounded-full"
        />
      ) : (
        <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center">
          <Feather name="user" size={24} color={COLORS.primary} />
        </View>
      )}

      <View className="flex-1 ml-3">
        <Text
          className="font-semibold text-[16px] text-ink"
          numberOfLines={1}
        >
          {fullName}
        </Text>
        <Text className="text-[13px] text-ink-soft mt-0.5">
          {t("Nhân viên thực hiện")}</Text>
      </View>

      {!!assignmentId && (
        <Feather name="chevron-right" size={20} color={COLORS.inkMuted} />
      )}
    </View>
  );

  if (!assignmentId) {
    return content;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/worker/[id]",
          params: {
            id: String(worker.worker_id),
            data: JSON.stringify(worker),
            assignmentId: String(assignmentId),
          },
        });
      }}
    >
      {content}
    </TouchableOpacity>
  );
}

function NoWorkerRow() {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  return (
    <View className="flex-row items-center mt-3 pt-3 border-t border-line">
      <View className="w-16 h-16 rounded-full bg-canvas items-center justify-center">
        <Feather name="user" size={24} color={COLORS.inkMuted} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-[16px] text-ink">
          {t("Chưa có nhân viên")}</Text>
        <Text className="text-[13px] text-ink-soft mt-0.5">
          {t("Đang chờ nhân viên nhận việc")}</Text>
      </View>
    </View>
  );
}

export function ScheduleItemCard({
  schedule,
  onPress,
  onCancel,
}: {
  schedule: BookingScheduleDetail;
  onPress?: (schedule: BookingScheduleDetail) => void;
  onCancel?: (schedule: BookingScheduleDetail) => void;
}) {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const { weekday, dateStr, startTime, endTime } = formatDateRange(
    schedule.scheduled_start,
    schedule.scheduled_end,
  );

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress ? () => onPress(schedule) : undefined}
      className="rounded-2xl p-4"
      style={{
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.line,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-[15px] text-ink-soft">
          {t("Buổi")}{" "}{schedule.sequence_no}
        </Text>
        <StatusBadge status={schedule.status} />
      </View>

      <View className="flex-row items-center mt-1.5">
        <Feather name="calendar" size={18} color={COLORS.primary} />
        <Text className="ml-2 text-[16px] font-semibold text-ink">
          {weekday}, {dateStr}
        </Text>
      </View>

      <View className="flex-row items-center mt-2">
        <Feather name="clock" size={18} color={COLORS.primary} />
        <Text className="ml-2 text-[15px] text-ink-soft">
          {startTime} - {endTime}
        </Text>
      </View>

      {!!schedule.note && (
        <View className="flex-row items-start mt-1.5">
          <Feather name="file-text" size={15} color={COLORS.inkMuted} />
          <Text className="ml-2 text-[13px] text-ink-soft flex-1">
            {schedule.note}
          </Text>
        </View>
      )}

      {!!schedule.cancel_reason &&
        (schedule.status === "CANCELLED" || schedule.status === "MISSED") && (
          <View className="flex-row items-start mt-2 p-2.5 rounded-xl bg-red-50">
            <Feather name="info" size={14} color={COLORS.danger} />
            <Text className="ml-2 text-[13px] text-ink-soft flex-1">
              <Text className="font-bold">{t("Lý do:")} </Text>
              {schedule.cancel_reason}
            </Text>
          </View>
        )}

      {schedule.worker ? (
        <WorkerRow
          worker={schedule.worker}
          assignmentId={schedule.assignment_id}
        />
      ) : schedule.status === "PENDING" ? (
        <NoWorkerRow />
      ) : null}

      {onCancel &&
        schedule.status === "PENDING" &&
        (canCancelSchedule(schedule.scheduled_start) ? (
          <TouchableOpacity
            onPress={() => onCancel(schedule)}
            activeOpacity={0.8}
            className="flex-row items-center justify-center mt-3 rounded-full border border-danger"
            style={{ height: 40 }}
          >
            <Feather name="x-circle" size={15} color="#DC2626" />
            <Text className="ml-1.5 text-[13px] font-bold text-danger">
              {t("Hủy buổi này")}</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-[12px] text-ink-soft text-center mt-3">
            {t("Chỉ hủy được trước giờ bắt đầu ít nhất")}{" "}{CUSTOMER_MIN_CANCEL_HOURS}{" "}
            {t("giờ.")}</Text>
        ))}
    </TouchableOpacity>
  );
}
