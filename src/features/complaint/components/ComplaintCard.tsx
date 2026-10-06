import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import type {
    ComplaintListItem,
    ComplaintStatus,
} from "@/features/complaint/types/Complaint";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { Feather } from "@expo/vector-icons";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export const COMPLAINT_STATUS_META: Record<
  ComplaintStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: keyof typeof Feather.glyphMap;
    hint: string;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: COLORS.accentDark,
    bg: COLORS.accentLight,
    icon: "clock",
    hint: "Khiếu nại đã gửi, đang chờ CleanWise tiếp nhận.",
  },
  IN_REVIEW: {
    label: "Đang xem xét",
    color: COLORS.infoDark,
    bg: COLORS.infoLight,
    icon: "search",
    hint: "CleanWise đang xem xét khiếu nại của bạn.",
  },
  RESOLVED: {
    label: "Đã giải quyết",
    color: COLORS.success,
    bg: COLORS.successLight,
    icon: "check-circle",
    hint: "Khiếu nại đã được giải quyết.",
  },
  REJECTED: {
    label: "Bị từ chối",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    icon: "x-circle",
    hint: "Khiếu nại không được chấp nhận.",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: COLORS.inkSoft,
    bg: COLORS.line,
    icon: "slash",
    hint: "Bạn đã hủy khiếu nại này.",
  },
};

export function ComplaintCard({
  item,
  onPress,
}: {
  item: ComplaintListItem;
  onPress: () => void;
}) {
  const meta = COMPLAINT_STATUS_META[item.status] ?? {
    label: item.status_label,
    color: COLORS.inkSoft,
    bg: COLORS.line,
    icon: "info" as const,
    hint: "",
  };
  const dead = item.status === "CANCELLED";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-surface border border-line mb-4 overflow-hidden"
      style={[
        { borderRadius: RADIUS.card },
        SHADOWS.card,
        dead && { opacity: 0.75 },
      ]}
    >
      {/* Mã đơn + buổi: cùng một khối chữ */}
      <View className="px-4 py-3" style={{ backgroundColor: meta.bg }}>
        <Text
          className="text-[10.5px] font-bold"
          style={{ color: meta.color, letterSpacing: 0.5 }}
        >
          MÃ ĐƠN
        </Text>
        <Text
          selectable
          className="text-ink text-[17px] font-extrabold mt-0.5"
          style={{ fontFamily: MONO, letterSpacing: 0.6 }}
        >
          {item.booking_code}
          {item.schedule_sequence_no != null && (
            <Text
              className="text-[14px] font-bold"
              style={{
                color: meta.color,
                fontFamily: undefined,
                letterSpacing: 0,
              }}
            >
              {`  ·  Buổi ${item.schedule_sequence_no}`}
            </Text>
          )}
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-ink font-bold text-[16px]" numberOfLines={2}>
          {item.issue_type_name}
        </Text>

        <View className="flex-row items-center mt-2.5">
          <View
            className="flex-row items-center px-2.5 py-1 rounded-full"
            style={{ backgroundColor: meta.bg }}
          >
            <Feather name={meta.icon} size={11} color={meta.color} />
            <Text
              className="text-[11.5px] font-bold ml-1.5"
              style={{ color: meta.color }}
            >
              {meta.label}
            </Text>
          </View>
          <Text
            className="text-ink-muted text-[12px] ml-3 flex-1"
            numberOfLines={1}
          >
            {formatReviewDate(item.created_at)}
          </Text>
        </View>

        <Text className="text-ink-soft text-[13px] mt-3" numberOfLines={1}>
          {item.stage_label}
          {item.worker_name ? ` · NV: ${item.worker_name}` : ""}
        </Text>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-dashed border-line">
          <Text
            className="flex-1 text-[12.5px] font-semibold mr-3"
            style={{ color: meta.color }}
            numberOfLines={2}
          >
            {meta.hint}
          </Text>
          <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
