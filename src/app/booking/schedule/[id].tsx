import { ReviewFeedbackButtons } from "@/components/booking/ReviewFeedbackButtons";
import { COLORS } from "@/components/service/formFieldShared";
import type { BookingScheduleDetail } from "@/types/Booking";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComplaintModal } from "@/components/complaints/ComplaintModal";

const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    icon: keyof typeof Feather.glyphMap;
  }
> = {
  PENDING: {
    label: "Chờ thực hiện",
    bg: "#FEF3C7",
    text: "#92400E",
    icon: "clock",
  },

  IN_PROGRESS: {
    label: "Đang thực hiện",
    bg: "#DBEAFE",
    text: "#1E40AF",
    icon: "loader",
  },

  COMPLETED: {
    label: "Đã hoàn thành",
    bg: "#D1FAE5",
    text: "#065F46",
    icon: "check-circle",
  },

  CANCELLED: {
    label: "Đã hủy",
    bg: "#FEE2E2",
    text: "#991B1B",
    icon: "x-circle",
  },

  MISSED: {
    label: "Bỏ lỡ",
    bg: "#F3F4F6",
    text: "#6B7280",
    icon: "alert-triangle",
  },
};

// Thứ tự cố định 3 hàng ảnh minh chứng — luôn hiện đủ, kể cả khi chưa có ảnh
const IMAGE_TYPE_ORDER: {
  type: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { type: "BEFORE", label: "Trước khi làm", icon: "image" },
  { type: "AFTER", label: "Sau khi làm", icon: "image" },
  { type: "ISSUE", label: "Báo cáo sự cố", icon: "alert-triangle" },
];

const IMAGE_TYPE_LABEL: Record<string, string> = {
  BEFORE: "Trước khi làm",
  AFTER: "Sau khi làm",
  ISSUE: "Báo cáo sự cố",
  OTHER: "Khác",
};

function formatFull(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const weekday = WEEKDAY_LABELS[d.getDay()];
  const dateStr = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { weekday, dateStr, timeStr };
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
  empty,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
  empty?: boolean;
}) {
  return (
    <View
      className="flex-row items-center py-3"
      style={
        !isLast
          ? { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }
          : undefined
      }
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: empty ? "#F9FAFB" : "#F0FDF4" }}
      >
        <Feather
          name={icon}
          size={16}
          color={empty ? "#D1D5DB" : COLORS.primary}
        />
      </View>
      <Text className="ml-3 text-[13.5px] text-gray-500 flex-1">{label}</Text>
      <Text
        className="text-[14px] font-bold"
        style={{ color: empty ? "#D1D5DB" : "#111827" }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ScheduleDetailScreen() {
  const { data, bookingId, bookingStatus } = useLocalSearchParams<{
    id: string;
    data: string;
    bookingId: string;
    bookingStatus: string;
  }>();
  const insets = useSafeAreaInsets();
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const [complaintVisible, setComplaintVisible] = useState(false);

  const schedule: BookingScheduleDetail | null = useMemo(() => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!schedule) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Feather name="alert-circle" size={36} color="#DC2626" />
        <Text className="text-gray-900 font-semibold mt-4">
          Không tải được thông tin buổi làm việc
        </Text>
        <TouchableOpacity
          className="mt-5 bg-emerald-700 rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const config = STATUS_CONFIG[schedule.status] ?? STATUS_CONFIG.PENDING;
  const scheduled = formatFull(schedule.scheduled_start);
  const actualStart = formatFull(schedule.actual_start);
  const actualEnd = formatFull(schedule.actual_end);
  const images = schedule.images ?? [];
  const canReview = schedule.status === "COMPLETED";

  const canComplaint =
    bookingStatus === "PENDING" ||
    bookingStatus === "ASSIGNED" ||
    bookingStatus === "IN_PROGRESS" ||
    bookingStatus === "COMPLETED";

  const worker = schedule.worker;

  const groupedImages = images.reduce<Record<string, typeof images>>(
    (acc, img) => {
      (acc[img.image_type] ??= []).push(img);
      return acc;
    },
    {},
  );
  const otherImages = groupedImages.OTHER ?? [];

  // Luôn hiện đủ 4 field — chỗ nào chưa có dữ liệu (do chưa cập nhật trạng thái) để trống
  const infoRows: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    empty: boolean;
  }[] = [
    {
      icon: "calendar",
      label: "Lịch hẹn",
      value: scheduled ? `${scheduled.weekday}, ${scheduled.dateStr}` : "—",
      empty: !scheduled,
    },
    {
      icon: "clock",
      label: "Khung giờ",
      value: scheduled ? scheduled.timeStr : "—",
      empty: !scheduled,
    },
    {
      icon: "play-circle",
      label: "Bắt đầu thực tế",
      value: actualStart ? actualStart.timeStr : "Chưa cập nhật",
      empty: !actualStart,
    },
    {
      icon: "check-circle",
      label: "Hoàn thành lúc",
      value: actualEnd ? actualEnd.timeStr : "Chưa cập nhật",
      empty: !actualEnd,
    },
  ];

  const fullName = worker
    ? `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
      "Nhân viên"
    : "";

  const goToWorker = () => {
    if (!worker) return;
    router.push({
      pathname: "/worker/[id]",
      params: {
        id: String(worker.worker_id),
        data: JSON.stringify(worker),
        assignmentId: String(schedule.assignment_id ?? ""),
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-5 pb-4"
        style={{
          paddingTop: insets.top + 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[12.5px] text-gray-400 font-medium mb-1">
              Chi tiết buổi làm việc
            </Text>
            <Text className="text-[22px] font-extrabold text-gray-900">
              Buổi {schedule.sequence_no}
            </Text>
          </View>

          <View
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: config.bg }}
          >
            <Feather name={config.icon} size={13} color={config.text} />
            <Text
              className="ml-1.5 text-[12px] font-bold"
              style={{ color: config.text }}
            >
              {config.label}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
      >
        {/* 4 field cố định */}
        <View
          className="rounded-2xl px-4"
          style={{ backgroundColor: "#FAFAFA" }}
        >
          {infoRows.map((row, idx) => (
            <InfoRow
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.value}
              empty={row.empty}
              isLast={idx === infoRows.length - 1}
            />
          ))}
        </View>

        {!!schedule.note && (
          <View
            className="flex-row items-start mt-4 p-4 rounded-2xl"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <Feather name="file-text" size={16} color="#9CA3AF" />
            <Text className="ml-2.5 text-[13.5px] text-gray-600 flex-1 leading-5">
              {schedule.note}
            </Text>
          </View>
        )}

        {worker && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToWorker}
            className="flex-row items-center mt-4 p-4 rounded-2xl"
            style={{ backgroundColor: "#FAFAFA" }}
          >
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
            <View className="ml-3 flex-1">
              <Text className="font-bold text-[16px] text-gray-900">
                {fullName}
              </Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">
                Nhân viên thực hiện
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Ảnh minh chứng — luôn hiện đủ 3 hàng: trước khi làm / sau khi làm / báo cáo sự cố */}
        <View className="mt-5">
          <Text className="text-[14.5px] font-bold text-gray-900 mb-3">
            Ảnh minh chứng
          </Text>

          {IMAGE_TYPE_ORDER.map(({ type, label, icon }) => {
            const imgs = groupedImages[type] ?? [];
            return (
              <View key={type} className="mb-4">
                <Text className="text-[12.5px] text-gray-500 mb-2">
                  {label} ({imgs.length})
                </Text>

                {imgs.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row" style={{ gap: 10 }}>
                      {imgs.map((img) => (
                        <TouchableOpacity
                          key={img.id}
                          activeOpacity={0.85}
                          onPress={() => setViewerImage(img.image)}
                        >
                          <Image
                            source={{ uri: img.image }}
                            style={{ width: 96, height: 96, borderRadius: 16 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View
                    className="items-center justify-center rounded-2xl"
                    style={{
                      height: 72,
                      backgroundColor: "#FAFAFA",
                      borderWidth: 1,
                      borderColor: "#F3F4F6",
                      borderStyle: "dashed",
                    }}
                  >
                    <Feather name={icon} size={16} color="#D1D5DB" />
                    <Text className="text-[12px] text-gray-300 mt-1">
                      Chưa có ảnh
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {otherImages.length > 0 && (
            <View className="mb-1">
              <Text className="text-[12.5px] text-gray-500 mb-2">
                {IMAGE_TYPE_LABEL.OTHER} ({otherImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row" style={{ gap: 10 }}>
                  {otherImages.map((img) => (
                    <TouchableOpacity
                      key={img.id}
                      activeOpacity={0.85}
                      onPress={() => setViewerImage(img.image)}
                    >
                      <Image
                        source={{ uri: img.image }}
                        style={{ width: 96, height: 96, borderRadius: 16 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {canComplaint && (
          <ReviewFeedbackButtons
            style={{ marginTop: 20 }}
            onReview={
              canReview
                ? () => {
                    // TODO: mở màn hình đánh giá
                  }
                : undefined
            }
            onFeedback={() => {
              setComplaintVisible(true);
            }}
          />
        )}
      </ScrollView>

      <ComplaintModal
        visible={complaintVisible}
        bookingId={Number(bookingId)}
        scheduleId={schedule.id}
        bookingStatus={bookingStatus}
        onClose={() => setComplaintVisible(false)}
      />

      <Modal
        visible={!!viewerImage}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerImage(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setViewerImage(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.92)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setViewerImage(null)}
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {viewerImage && (
            <Image
              source={{ uri: viewerImage }}
              style={{ width: "100%", height: "80%" }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
