import { ReviewFeedbackButtons } from "@/components/booking/ReviewFeedbackButtons";
import { COLORS } from "@/components/service/formFieldShared";
import type { BookingScheduleDetail } from "@/types/Booking";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SectionTitle } from "./SectionTitle";

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
  OTHER: "Khác",
};

function formatTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

export function SingleScheduleSection({
  schedule,
}: {
  schedule: BookingScheduleDetail;
}) {
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const config = STATUS_CONFIG[schedule.status] ?? STATUS_CONFIG.PENDING;
  const images = schedule.images ?? [];
  const canReview = schedule.status === "COMPLETED";
  const worker = schedule.worker;

  const groupedImages = images.reduce<Record<string, typeof images>>(
    (acc, img) => {
      (acc[img.image_type] ??= []).push(img);
      return acc;
    },
    {},
  );
  const otherImages = groupedImages.OTHER ?? [];

  const actualStart = formatTime(schedule.actual_start);
  const actualEnd = formatTime(schedule.actual_end);

  const infoRows: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value: string;
    empty: boolean;
  }[] = [
    {
      icon: "calendar",
      label: "Khung giờ hẹn",
      value: `${new Date(schedule.scheduled_start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(schedule.scheduled_end).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
      empty: false,
    },
    {
      icon: "play-circle",
      label: "Bắt đầu thực tế",
      value: actualStart ?? "Chưa cập nhật",
      empty: !actualStart,
    },
    {
      icon: "check-circle",
      label: "Hoàn thành lúc",
      value: actualEnd ?? "Chưa cập nhật",
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
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-3">
        <SectionTitle icon="user">Buổi làm việc</SectionTitle>
        <View
          className="flex-row items-center px-2.5 py-1 rounded-full"
          style={{ backgroundColor: config.bg }}
        >
          <Feather name={config.icon} size={12} color={config.text} />
          <Text
            className="ml-1.5 text-[11.5px] font-bold"
            style={{ color: config.text }}
          >
            {config.label}
          </Text>
        </View>
      </View>

      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {/* Field thời gian */}
        <View
          className="rounded-2xl px-3"
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
            className="flex-row items-start mt-3 p-3.5 rounded-2xl"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <Feather name="file-text" size={16} color="#9CA3AF" />
            <Text className="ml-2.5 text-[13.5px] text-gray-600 flex-1 leading-5">
              {schedule.note}
            </Text>
          </View>
        )}

        {worker ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToWorker}
            className="flex-row items-center mt-3 p-3.5 rounded-2xl"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            {worker.avatar ? (
              <Image
                source={{ uri: worker.avatar }}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-emerald-100 items-center justify-center">
                <Feather name="user" size={22} color={COLORS.primary} />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="font-bold text-[15px] text-gray-900">
                {fullName}
              </Text>
              <Text className="text-[12.5px] text-gray-500 mt-0.5">
                Nhân viên thực hiện
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : (
          <View
            className="flex-row items-center mt-3 p-3.5 rounded-2xl"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
              <Feather name="user" size={22} color="#9CA3AF" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-[15px] text-gray-700">
                Chưa có nhân viên
              </Text>
              <Text className="text-[12.5px] text-gray-500 mt-0.5">
                Đang chờ nhân viên nhận việc
              </Text>
            </View>
          </View>
        )}

        {/* Ảnh minh chứng — luôn 3 hàng */}
        <View className="mt-4">
          <Text className="text-[13.5px] font-bold text-gray-900 mb-2.5">
            Ảnh minh chứng
          </Text>

          {IMAGE_TYPE_ORDER.map(({ type, label, icon }) => {
            const imgs = groupedImages[type] ?? [];
            return (
              <View key={type} className="mb-3">
                <Text className="text-[12px] text-gray-500 mb-1.5">
                  {label} ({imgs.length})
                </Text>

                {imgs.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row" style={{ gap: 8 }}>
                      {imgs.map((img) => (
                        <TouchableOpacity
                          key={img.id}
                          activeOpacity={0.85}
                          onPress={() => setViewerImage(img.image)}
                        >
                          <Image
                            source={{ uri: img.image }}
                            style={{ width: 84, height: 84, borderRadius: 14 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <View
                    className="items-center justify-center rounded-2xl"
                    style={{
                      height: 64,
                      backgroundColor: "#FAFAFA",
                      borderWidth: 1,
                      borderColor: "#F3F4F6",
                      borderStyle: "dashed",
                    }}
                  >
                    <Feather name={icon} size={15} color="#D1D5DB" />
                    <Text className="text-[11.5px] text-gray-300 mt-1">
                      Chưa có ảnh
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {otherImages.length > 0 && (
            <View>
              <Text className="text-[12px] text-gray-500 mb-1.5">
                {IMAGE_TYPE_LABEL.OTHER} ({otherImages.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row" style={{ gap: 8 }}>
                  {otherImages.map((img) => (
                    <TouchableOpacity
                      key={img.id}
                      activeOpacity={0.85}
                      onPress={() => setViewerImage(img.image)}
                    >
                      <Image
                        source={{ uri: img.image }}
                        style={{ width: 84, height: 84, borderRadius: 14 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {canReview && <ReviewFeedbackButtons style={{ marginTop: 16 }} />}
      </View>

      {/* Xem ảnh full screen */}
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
              top: 50,
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
