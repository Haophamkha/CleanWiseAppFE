import type { BookingScheduleDetail } from "@/types/Booking";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

export type ScheduleImage = NonNullable<
  BookingScheduleDetail["images"]
>[number];

const WEEKDAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export function formatFull(iso: string | null) {
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

export function useScheduleDetail() {
  const { data, bookingId, bookingStatus } = useLocalSearchParams<{
    id: string;
    data: string;
    bookingId: string;
    bookingStatus: string;
  }>();

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

  const worker = schedule?.worker ?? null;
  const images: ScheduleImage[] = schedule?.images ?? [];

  const groupedImages = images.reduce<Record<string, ScheduleImage[]>>(
    (acc, img) => {
      (acc[img.image_type] ??= []).push(img);
      return acc;
    },
    {},
  );

  const canComplaint =
    bookingStatus === "PENDING" ||
    bookingStatus === "ASSIGNED" ||
    bookingStatus === "IN_PROGRESS" ||
    bookingStatus === "COMPLETED";

  const fullName = worker
    ? `${worker.last_name ?? ""} ${worker.first_name ?? ""}`.trim() ||
      "Nhân viên"
    : "";

  const goToWorker = () => {
    if (!worker || !schedule) return;
    router.push({
      pathname: "/worker/[id]",
      params: {
        id: String(worker.worker_id),
        data: JSON.stringify(worker),
        assignmentId: String(schedule.assignment_id ?? ""),
      },
    });
  };

  return {
    schedule,
    worker,
    fullName,
    goBack: () => router.back(),
    goToWorker,

    scheduled: formatFull(schedule?.scheduled_start ?? null),
    actualStart: formatFull(schedule?.actual_start ?? null),
    actualEnd: formatFull(schedule?.actual_end ?? null),

    groupedImages,
    otherImages: groupedImages.OTHER ?? [],
    viewerImage,
    setViewerImage,

    canReview: schedule?.status === "COMPLETED",
    canComplaint,
    complaintVisible,
    setComplaintVisible,
    bookingId: Number(bookingId),
    bookingStatus,
  };
}
