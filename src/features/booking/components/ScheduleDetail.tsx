import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import {
  useScheduleDetail,
  type ScheduleImage,
} from "@/features/booking/hooks/useScheduleDetail";
import { ComplaintModal } from "@/features/complaint/components/ComplaintModal";
import { ScheduleReviewActions } from "@/features/review/components/ScheduleReviewActions";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = keyof typeof Feather.glyphMap;

const HERO_OVERLAP = 28;
const THUMB = 92;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: IconName }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    bg: COLORS.accentLight,
    text: COLORS.accentDark,
    icon: "clock",
  },
  IN_PROGRESS: {
    label: "Đang thực hiện",
    bg: COLORS.infoLight,
    text: COLORS.infoDark,
    icon: "loader",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    bg: COLORS.primaryLight,
    text: COLORS.primaryDark,
    icon: "check-circle",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: COLORS.dangerLight,
    text: COLORS.danger,
    icon: "x-circle",
  },
  MISSED: {
    label: "Không có nhân viên nhận",
    bg: COLORS.canvas,
    text: COLORS.inkSoft,
    icon: "alert-triangle",
  },
};

// Thứ tự cố định 3 nhóm ảnh minh chứng — luôn hiện đủ, kể cả khi chưa có ảnh
const IMAGE_GROUPS: {
  type: string;
  label: string;
  icon: IconName;
  danger?: boolean;
}[] = [
  { type: "BEFORE", label: "Trước khi làm", icon: "sunrise" },
  { type: "AFTER", label: "Sau khi làm", icon: "sunset" },
  {
    type: "ISSUE",
    label: "Báo cáo sự cố",
    icon: "alert-triangle",
    danger: true,
  },
];

/* ───────────────────────── Thành phần nhỏ ───────────────────────── */

function Card({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        {
          marginBottom: 14,
          padding: 16,
          borderRadius: RADIUS.card,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      {!!title && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          {!!icon && (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.primaryLight,
              }}
            >
              <Feather name={icon} size={15} color={COLORS.primaryDark} />
            </View>
          )}
          <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.ink }}>
            {title}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}

function TimelineStep({
  icon,
  label,
  time,
  date,
  last,
}: {
  icon: IconName;
  label: string;
  time: string | null;
  date?: string;
  last?: boolean;
}) {
  const done = !!time;
  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ width: 38, alignItems: "center" }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: done ? COLORS.primary : COLORS.canvas,
            borderWidth: done ? 0 : 1.5,
            borderStyle: "dashed",
            borderColor: COLORS.line,
          }}
        >
          <Feather
            name={icon}
            size={15}
            color={done ? COLORS.white : COLORS.inkMuted}
          />
        </View>
        {!last && (
          <View
            style={{
              flex: 1,
              width: 2,
              marginVertical: 4,
              borderRadius: 1,
              backgroundColor: done ? COLORS.primaryBorder : COLORS.line,
            }}
          />
        )}
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginLeft: 12,
          paddingBottom: last ? 0 : 18,
        }}
      >
        <Text
          style={{
            paddingTop: 8,
            fontSize: 13.5,
            fontWeight: "600",
            color: COLORS.inkSoft,
          }}
        >
          {label}
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              paddingTop: 2,
              fontSize: done ? 18 : 13.5,
              fontWeight: done ? "800" : "500",
              color: done ? COLORS.ink : COLORS.inkMuted,
            }}
          >
            {time ?? "Chưa cập nhật"}
          </Text>
          {!!date && (
            <Text
              style={{ marginTop: 1, fontSize: 12, color: COLORS.inkMuted }}
            >
              {date}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function ImageGroup({
  icon,
  label,
  imgs,
  danger,
  onOpen,
}: {
  icon: IconName;
  label: string;
  imgs: ScheduleImage[];
  danger?: boolean;
  onOpen: (uri: string) => void;
}) {
  const tint = danger ? COLORS.dangerLight : COLORS.primaryLight;
  const tone = danger ? COLORS.danger : COLORS.primaryDark;

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Feather name={icon} size={14} color={tone} />
        <Text
          style={{
            flex: 1,
            marginLeft: 6,
            fontSize: 13,
            fontWeight: "700",
            color: COLORS.inkSoft,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            minWidth: 24,
            paddingHorizontal: 8,
            paddingVertical: 2,
            alignItems: "center",
            borderRadius: 10,
            backgroundColor: imgs.length ? tint : COLORS.canvas,
          }}
        >
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: "800",
              color: imgs.length ? tone : COLORS.inkMuted,
            }}
          >
            {imgs.length}
          </Text>
        </View>
      </View>

      {imgs.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {imgs.map((img) => (
              <TouchableOpacity
                key={img.id}
                activeOpacity={0.85}
                onPress={() => onOpen(img.image)}
              >
                <Image
                  source={{ uri: img.image }}
                  style={{
                    width: THUMB,
                    height: THUMB,
                    borderRadius: 16,
                    backgroundColor: COLORS.canvas,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: COLORS.line,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            height: 60,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: COLORS.line,
            backgroundColor: COLORS.canvas,
          }}
        >
          <Feather name="image" size={15} color={COLORS.inkMuted} />
          <Text
            style={{ marginLeft: 6, fontSize: 12.5, color: COLORS.inkMuted }}
          >
            Chưa có ảnh
          </Text>
        </View>
      )}
    </View>
  );
}

/* ───────────────────────── Màn hình ───────────────────────── */

export function ScheduleDetail() {
  const s = useScheduleDetail();
  const insets = useSafeAreaInsets();

  if (!s.schedule) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
          backgroundColor: COLORS.canvas,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.dangerLight,
          }}
        >
          <Feather name="alert-circle" size={30} color={COLORS.danger} />
        </View>
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: "800",
            textAlign: "center",
            color: COLORS.ink,
          }}
        >
          Không tải được thông tin buổi làm việc
        </Text>
        <TouchableOpacity
          onPress={s.goBack}
          activeOpacity={0.85}
          style={{
            marginTop: 20,
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: COLORS.primary,
          }}
        >
          <Text style={{ fontWeight: "800", color: COLORS.white }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { schedule, worker } = s;
  const config = STATUS_CONFIG[schedule.status] ?? STATUS_CONFIG.PENDING;
  const scheduledDate = s.scheduled
    ? `${s.scheduled.weekday}, ${s.scheduled.dateStr}`
    : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* ── Hero ── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 10,
            paddingBottom: HERO_OVERLAP + 18,
            paddingHorizontal: 20,
            overflow: "hidden",
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -90,
              right: -50,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: -70,
              left: -40,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          <TouchableOpacity
            onPress={s.goBack}
            hitSlop={8}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          >
            <Feather name="arrow-left" size={19} color={COLORS.white} />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 18,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Chi tiết buổi làm việc
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 28,
                  fontWeight: "900",
                  color: COLORS.white,
                }}
              >
                Buổi {schedule.sequence_no}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: config.bg,
              }}
            >
              <Feather name={config.icon} size={13} color={config.text} />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12.5,
                  fontWeight: "800",
                  color: config.text,
                }}
              >
                {config.label}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Sheet nội dung ── */}
        <View
          style={{
            marginTop: -HERO_OVERLAP,
            paddingTop: 20,
            paddingHorizontal: 20,
            borderTopLeftRadius: RADIUS.hero,
            borderTopRightRadius: RADIUS.hero,
            backgroundColor: COLORS.canvas,
          }}
        >
          {/* Tiến độ: lịch hẹn → bắt đầu → hoàn thành. Luôn hiện đủ, chỗ nào chưa có thì để trống */}
          <Card title="Tiến độ buổi làm" icon="activity">
            <TimelineStep
              icon="calendar"
              label="Lịch hẹn"
              time={s.scheduled?.timeStr ?? null}
              date={scheduledDate}
            />
            <TimelineStep
              icon="play-circle"
              label="Bắt đầu thực tế"
              time={s.actualStart?.timeStr ?? null}
              date={
                s.actualStart
                  ? `${s.actualStart.weekday}, ${s.actualStart.dateStr}`
                  : undefined
              }
            />
            <TimelineStep
              icon="check-circle"
              label="Hoàn thành lúc"
              time={s.actualEnd?.timeStr ?? null}
              date={
                s.actualEnd
                  ? `${s.actualEnd.weekday}, ${s.actualEnd.dateStr}`
                  : undefined
              }
              last
            />
          </Card>

          {!!schedule.note && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 14,
                padding: 16,
                borderRadius: RADIUS.card,
                borderLeftWidth: 4,
                borderLeftColor: COLORS.accent,
                backgroundColor: COLORS.accentLight,
              }}
            >
              <Feather name="file-text" size={16} color={COLORS.accentDark} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    letterSpacing: 0.6,
                    color: COLORS.accentDark,
                  }}
                >
                  GHI CHÚ
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 14,
                    lineHeight: 21,
                    color: COLORS.ink,
                  }}
                >
                  {schedule.note}
                </Text>
              </View>
            </View>
          )}

          {worker && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={s.goToWorker}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 14,
                  padding: 14,
                  borderRadius: RADIUS.card,
                  backgroundColor: COLORS.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: COLORS.line,
                },
                SHADOWS.card,
              ]}
            >
              {worker.avatar ? (
                <Image
                  source={{ uri: worker.avatar }}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    borderWidth: 2,
                    borderColor: COLORS.primaryLight,
                    backgroundColor: COLORS.primarySoft,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.primaryLight,
                  }}
                >
                  <Feather name="user" size={24} color={COLORS.primaryDark} />
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                    color: COLORS.inkMuted,
                  }}
                >
                  NHÂN VIÊN THỰC HIỆN
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 2,
                    fontSize: 16,
                    fontWeight: "800",
                    color: COLORS.ink,
                  }}
                >
                  {s.fullName}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 12,
                  paddingRight: 8,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: COLORS.primarySoft,
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "700",
                    color: COLORS.primaryDark,
                  }}
                >
                  Hồ sơ
                </Text>
                <Feather
                  name="chevron-right"
                  size={15}
                  color={COLORS.primaryDark}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* Ảnh minh chứng — luôn hiện đủ 3 nhóm: trước / sau / sự cố */}
          <Card title="Ảnh minh chứng" icon="camera">
            {IMAGE_GROUPS.map((g) => (
              <ImageGroup
                key={g.type}
                icon={g.icon}
                label={g.label}
                danger={g.danger}
                imgs={s.groupedImages[g.type] ?? []}
                onOpen={s.setViewerImage}
              />
            ))}
            {s.otherImages.length > 0 && (
              <ImageGroup
                icon="folder"
                label="Khác"
                imgs={s.otherImages}
                onOpen={s.setViewerImage}
              />
            )}
          </Card>

          {s.canComplaint && (
            <ScheduleReviewActions
              assignmentId={schedule.assignment_id}
              completed={s.canReview}
              style={{ marginTop: 6 }}
              onFeedback={() => s.setComplaintVisible(true)}
            />
          )}
        </View>
      </ScrollView>

      <ComplaintModal
        visible={s.complaintVisible}
        bookingId={s.bookingId}
        scheduleId={schedule.id}
        bookingStatus={s.bookingStatus}
        onClose={() => s.setComplaintVisible(false)}
      />

      {/* Xem ảnh toàn màn hình */}
      <Modal
        visible={!!s.viewerImage}
        transparent
        animationType="fade"
        onRequestClose={() => s.setViewerImage(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => s.setViewerImage(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.94)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => s.setViewerImage(null)}
            hitSlop={8}
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 20,
              width: 42,
              height: 42,
              borderRadius: 21,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.16)",
              zIndex: 10,
            }}
          >
            <Feather name="x" size={22} color={COLORS.white} />
          </TouchableOpacity>
          {s.viewerImage && (
            <Image
              source={{ uri: s.viewerImage }}
              style={{ width: "100%", height: "80%" }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
