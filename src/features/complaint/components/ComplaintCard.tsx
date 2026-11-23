import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { RADIUS, SHADOWS } from "@/constants/theme";
import type {
  ComplaintListItem,
  ComplaintStatus,
} from "@/features/complaint/types/Complaint";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { Feather } from "@expo/vector-icons";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { getComplaintProgressLabel } from "../utils/complaintProgress";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export function getComplaintStatusMap(COLORS: ThemeColors, translateText = defaultTranslate): Record<
  ComplaintStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: keyof typeof Feather.glyphMap;
    hint: string;
  }
> {
  return {
  PENDING: {
    label: translateText("Chờ xử lý"),
    color: COLORS.accentDark,
    bg: COLORS.accentLight,
    icon: "clock",
    hint: translateText("Khiếu nại đã gửi, đang chờ CleanWise tiếp nhận."),
  },
  IN_REVIEW: {
    label: translateText("Đang xem xét"),
    color: COLORS.infoDark,
    bg: COLORS.infoLight,
    icon: "search",
    hint: translateText("CleanWise đang xem xét khiếu nại của bạn."),
  },
  RESOLVED: {
    label: translateText("Đã giải quyết"),
    color: COLORS.success,
    bg: COLORS.successLight,
    icon: "check-circle",
    hint: translateText("Khiếu nại đã được giải quyết."),
  },
  REJECTED: {
    label: translateText("Bị từ chối"),
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    icon: "x-circle",
    hint: translateText("Khiếu nại không được chấp nhận."),
  },
  CANCELLED: {
    label: translateText("Đã hủy"),
    color: COLORS.inkSoft,
    bg: COLORS.line,
    icon: "slash",
    hint: translateText("Bạn đã hủy khiếu nại này."),
  },
};
}

export function ComplaintCard({
  item,
  onPress,
}: {
  item: ComplaintListItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const COMPLAINT_STATUS_META = getComplaintStatusMap(COLORS, t);

  const meta = COMPLAINT_STATUS_META[item.status] ?? {
    label: item.status_label,
    color: COLORS.inkSoft,
    bg: COLORS.line,
    icon: "info" as const,
    hint: "",
  };

  const dead = item.status === "CANCELLED";
  const progressLabel = getComplaintProgressLabel(item.status, item.workflow_status);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        {
          marginBottom: 16,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.line,
          overflow: "hidden",
        },
        SHADOWS.card,
        dead && { opacity: 0.75 },
      ]}
    >
      <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: meta.color }} />

      <View style={{ paddingVertical: 16, paddingLeft: 20, paddingRight: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: meta.bg }}>
            <Feather name={meta.icon} size={20} color={meta.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
              {item.issue_type_name}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.inkMuted }} numberOfLines={1}>
              {formatReviewDate(item.created_at, t)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 10.5, fontWeight: "700", letterSpacing: 0.6, color: COLORS.inkMuted }}>
              {t("M\u00c3 KHI\u1ebeU N\u1ea0I")}
            </Text>
            <Text
              selectable
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ marginTop: 2, fontSize: 16, fontWeight: "800", color: COLORS.ink, fontFamily: MONO, letterSpacing: 0.5 }}
            >
              {item.code ?? `#${item.id}`}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: meta.bg }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.color, marginRight: 6 }} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: meta.color }}>
              {progressLabel ? t(progressLabel) : meta.label}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: COLORS.canvas }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="file-text" size={13} color={COLORS.inkMuted} />
            <Text numberOfLines={1} style={{ flex: 1, marginLeft: 6, fontSize: 12.5, fontWeight: "600", color: COLORS.ink }}>
              {t("\u0110\u01a1n")}{" "}{item.booking_code}
              {item.schedule_sequence_no != null
                ? t("  \u00b7  Bu\u1ed5i {{value0}}", { value0: item.schedule_sequence_no })
                : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Feather name="flag" size={13} color={COLORS.inkMuted} />
            <Text numberOfLines={1} style={{ flex: 1, marginLeft: 6, fontSize: 12.5, color: COLORS.inkSoft }}>
              {item.stage_label}
              {item.worker_name ? ` \u00b7 NV: ${item.worker_name}` : ""}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
          <Text numberOfLines={2} style={{ flex: 1, marginRight: 8, fontSize: 12.5, fontWeight: "600", color: meta.color }}>
            {meta.hint}
          </Text>
          <Feather name="chevron-right" size={18} color={COLORS.inkMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}