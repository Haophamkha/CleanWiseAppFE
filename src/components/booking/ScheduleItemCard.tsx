import { COLORS } from "@/components/service/formFieldShared";
import type { BookingScheduleDetail } from "@/types/Booking";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Worker = NonNullable<BookingScheduleDetail["worker"]>;

const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

// Khớp với BookingSchedule.Status bên BE (models.py)
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    bg: "#FEF3C7",
    text: "#92400E",
  },
  IN_PROGRESS: {
    label: "Đang làm buổi này",
    bg: "#DBEAFE",
    text: "#1E40AF",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    bg: "#D1FAE5",
    text: "#065F46",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#FEE2E2",
    text: "#991B1B",
  },
  MISSED: {
    label: "Bỏ lỡ",
    bg: "#F3F4F6",
    text: "#6B7280",
  },
};

function StatusBadge({ status }: { status: string }) {
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

  const weekday = WEEKDAY_LABELS[start.getDay()];
  const dateStr = start.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("vi-VN", {
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
  const fullName =
    `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
    "Nhân viên";

  const content = (
    <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
      {worker.avatar ? (
        <Image
          source={{ uri: worker.avatar }}
          className="w-11 h-11 rounded-full"
        />
      ) : (
        <View className="w-11 h-11 rounded-full bg-emerald-100 items-center justify-center">
          <Feather name="user" size={18} color={COLORS.primary} />
        </View>
      )}

      <View className="flex-1 ml-3">
        <Text
          className="font-semibold text-[14px] text-gray-900"
          numberOfLines={1}
        >
          {fullName}
        </Text>
        <Text className="text-[12px] text-gray-500">Nhân viên thực hiện</Text>
      </View>

      {!!assignmentId && (
        <Feather name="chevron-right" size={18} color="#9CA3AF" />
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
  return (
    <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
      <View className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
        <Feather name="user" size={18} color="#9CA3AF" />
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-[14px] text-gray-700">
          Chưa có nhân viên
        </Text>
        <Text className="text-[12px] text-gray-500">
          Đang chờ nhân viên nhận việc
        </Text>
      </View>
    </View>
  );
}

export function ScheduleItemCard({
  schedule,
}: {
  schedule: BookingScheduleDetail;
}) {
  const { weekday, dateStr, startTime, endTime } = formatDateRange(
    schedule.scheduled_start,
    schedule.scheduled_end,
  );

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="font-bold text-[13px] text-gray-500">
          Buổi {schedule.sequence_no}
        </Text>
        <StatusBadge status={schedule.status} />
      </View>

      <View className="flex-row items-center mt-1">
        <Feather name="calendar" size={15} color={COLORS.primary} />
        <Text className="ml-2 text-[14px] font-semibold text-gray-900">
          {weekday}, {dateStr}
        </Text>
      </View>

      <View className="flex-row items-center mt-1.5">
        <Feather name="clock" size={15} color={COLORS.primary} />
        <Text className="ml-2 text-[13px] text-gray-600">
          {startTime} - {endTime}
        </Text>
      </View>

      {!!schedule.note && (
        <View className="flex-row items-start mt-1.5">
          <Feather name="file-text" size={15} color="#9CA3AF" />
          <Text className="ml-2 text-[13px] text-gray-500 flex-1">
            {schedule.note}
          </Text>
        </View>
      )}

      {schedule.worker ? (
        <WorkerRow
          worker={schedule.worker}
          assignmentId={schedule.assignment_id}
        />
      ) : (
        <NoWorkerRow />
      )}
    </View>
  );
}
