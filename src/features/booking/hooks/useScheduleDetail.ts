import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import type { BookingScheduleDetail } from "@/features/booking/types/Booking";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

export type ScheduleImage = NonNullable<
  BookingScheduleDetail["images"]
>[number];

function getLocalizedWeekdayLabels(translateText = defaultTranslate) {
  return [
    translateText("Chủ nhật"),
    translateText("Thứ 2"),
    translateText("Thứ 3"),
    translateText("Thứ 4"),
    translateText("Thứ 5"),
    translateText("Thứ 6"),
    translateText("Thứ 7"),
  ];
}

export function formatFull(iso: string | null, translateText = defaultTranslate) {
  if (!iso) return null;
  const d = new Date(iso);
  const weekday = getLocalizedWeekdayLabels(translateText)[d.getDay()];
  const dateStr = d.toLocaleDateString(getLocale(translateText), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString(getLocale(translateText), {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { weekday, dateStr, timeStr };
}

export function useScheduleDetail() {
  const { t } = useTranslation();

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
  }, [data, t]);

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
      t("Nhân viên")
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

    scheduled: formatFull(schedule?.scheduled_start ?? null, t),
    actualStart: formatFull(schedule?.actual_start ?? null, t),
    actualEnd: formatFull(schedule?.actual_end ?? null, t),

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
