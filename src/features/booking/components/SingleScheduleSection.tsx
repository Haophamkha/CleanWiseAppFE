import { Card } from "@/components/ui/Card";
import { COLORS } from "@/constants/theme";
import { ReviewFeedbackButtons } from "@/features/booking/components/ReviewFeedbackButtons";
import type { BookingScheduleDetail } from "@/features/booking/types/Booking";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SectionTitle } from "./SectionTitle";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FeatherName = keyof typeof Feather.glyphMap;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: FeatherName }
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
    bg: COLORS.successLight,
    text: COLORS.success,
    icon: "check-circle",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: COLORS.dangerLight,
    text: COLORS.danger,
    icon: "x-circle",
  },
  MISSED: {
    label: "Bỏ lỡ",
    bg: COLORS.canvas,
    text: COLORS.inkSoft,
    icon: "alert-triangle",
  },
};

const IMAGE_TYPE_ORDER: { type: string; label: string; icon: FeatherName }[] = [
  { type: "BEFORE", label: "Trước khi làm", icon: "image" },
  { type: "AFTER", label: "Sau khi làm", icon: "image" },
  { type: "ISSUE", label: "Báo cáo sự cố", icon: "alert-triangle" },
];

const IMAGE_TYPE_LABEL: Record<string, string> = { OTHER: "Khác" };

const timeText = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

function formatTime(iso: string | null) {
  return iso ? timeText(iso) : null;
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
  empty,
}: {
  icon: FeatherName;
  label: string;
  value: string;
  isLast?: boolean;
  empty?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center py-3 ${
        isLast ? "" : "border-b border-line"
      }`}
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          empty ? "bg-surface" : "bg-primary-light"
        }`}
      >
        <Feather
          name={icon}
          size={16}
          color={empty ? COLORS.inkMuted : COLORS.primaryDark}
        />
      </View>
      <Text className="ml-3 text-[13.5px] text-ink-soft flex-1">{label}</Text>
      <Text
        className={`text-[14px] font-bold ${
          empty ? "text-ink-muted" : "text-ink"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function PhotoRow({
  label,
  icon,
  images,
  onOpen,
  showEmpty = true,
}: {
  label: string;
  icon: FeatherName;
  images: { id: number; image: string }[];
  onOpen: (uri: string) => void;
  showEmpty?: boolean;
}) {
  if (images.length === 0 && !showEmpty) return null;
  return (
    <View className="mb-3">
      <View className="flex-row items-center mb-1.5">
        <Text className="text-[12px] font-semibold text-ink-soft">{label}</Text>
        <View className="ml-1.5 px-1.5 rounded-full bg-surface">
          <Text className="text-[11px] font-bold text-ink-muted">
            {images.length}
          </Text>
        </View>
      </View>

      {images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row" style={{ gap: 8 }}>
            {images.map((img) => (
              <TouchableOpacity
                key={img.id}
                activeOpacity={0.85}
                onPress={() => onOpen(img.image)}
              >
                <Image
                  source={{ uri: img.image }}
                  style={{ width: 88, height: 88, borderRadius: 16 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View
          className="items-center justify-center rounded-2xl bg-surface border border-dashed border-line"
          style={{ height: 64 }}
        >
          <Feather name={icon} size={15} color={COLORS.inkMuted} />
          <Text className="text-[11.5px] text-ink-muted mt-1">Chưa có ảnh</Text>
        </View>
      )}
    </View>
  );
}

export function SingleScheduleSection({
  schedule,
}: {
  schedule: BookingScheduleDetail;
}) {
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [photosOpen, setPhotosOpen] = useState(false);

  const togglePhotos = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhotosOpen((v) => !v);
  };

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
    icon: FeatherName;
    label: string;
    value: string;
    empty: boolean;
  }[] = [
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
      <View className="flex-row items-center justify-between">
        <SectionTitle icon="user">Buổi làm việc</SectionTitle>
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full mb-3"
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

      <Card className="rounded-3xl">
        <View className="rounded-2xl bg-canvas px-3">
          {infoRows.map((row, idx) => (
            <InfoRow
              key={row.label}
              {...row}
              isLast={idx === infoRows.length - 1}
            />
          ))}
        </View>

        {!!schedule.note && (
          <View className="flex-row items-start mt-3 p-3.5 rounded-2xl bg-accent-light">
            <Feather name="file-text" size={16} color={COLORS.accentDark} />
            <Text className="ml-2.5 text-[13.5px] text-ink-soft flex-1 leading-5">
              {schedule.note}
            </Text>
          </View>
        )}

        {worker ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={goToWorker}
            className="flex-row items-center mt-3 p-3 rounded-2xl bg-primary-soft border border-primary-border"
          >
            {worker.avatar ? (
              <Image
                source={{ uri: worker.avatar }}
                className="w-14 h-14 rounded-full border-2 border-white"
              />
            ) : (
              <View className="w-14 h-14 rounded-full bg-primary-light items-center justify-center">
                <Feather name="user" size={22} color={COLORS.primaryDark} />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="font-bold text-[15px] text-ink">{fullName}</Text>
              <Text className="text-[12.5px] text-ink-soft mt-0.5">
                Nhân viên thực hiện
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-surface items-center justify-center">
              <Feather name="chevron-right" size={17} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center mt-3 p-3 rounded-2xl bg-canvas">
            <View className="w-14 h-14 rounded-full bg-surface items-center justify-center">
              <Feather name="user" size={22} color={COLORS.inkMuted} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-[15px] text-ink-soft">
                Chưa có nhân viên
              </Text>
              <Text className="text-[12.5px] text-ink-muted mt-0.5">
                Đang chờ nhân viên nhận việc
              </Text>
            </View>
          </View>
        )}

        {/* Ảnh minh chứng: đóng mặc định, bấm để mở */}
        <View className="mt-3 rounded-2xl border border-line overflow-hidden">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={togglePhotos}
            className="flex-row items-center px-3.5 py-3 bg-canvas"
          >
            <View className="w-9 h-9 rounded-full bg-primary-light items-center justify-center">
              <Feather name="camera" size={16} color={COLORS.primaryDark} />
            </View>
            <Text className="ml-3 flex-1 text-[14px] font-bold text-ink">
              Ảnh minh chứng
            </Text>
            <View className="mr-2 px-2 py-0.5 rounded-full bg-surface">
              <Text className="text-[11.5px] font-bold text-ink-soft">
                {images.length} ảnh
              </Text>
            </View>
            <Feather
              name={photosOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.inkSoft}
            />
          </TouchableOpacity>

          {photosOpen && (
            <View className="px-3.5 pt-3 pb-1 bg-surface">
              {IMAGE_TYPE_ORDER.map(({ type, label, icon }) => (
                <PhotoRow
                  key={type}
                  label={label}
                  icon={icon}
                  images={groupedImages[type] ?? []}
                  onOpen={setViewerImage}
                />
              ))}
              <PhotoRow
                label={IMAGE_TYPE_LABEL.OTHER}
                icon="image"
                images={otherImages}
                onOpen={setViewerImage}
                showEmpty={false}
              />
            </View>
          )}
        </View>

        {canReview && <ReviewFeedbackButtons style={{ marginTop: 12 }} />}
      </Card>

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
            <Feather name="x" size={22} color={COLORS.white} />
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
