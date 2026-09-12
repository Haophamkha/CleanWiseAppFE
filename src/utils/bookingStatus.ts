interface BookingStatusMeta {
  label: string;
  bgClass: string;
  textClass: string;
}

// Khớp với bookings.status trong DB: PENDING, CONFIRMED, IN_PROGRESS,
// COMPLETED, CANCELLED (giá trị khác ngoài danh sách vẫn hiển thị được,
// dùng label mặc định là chính status đó).
const BOOKING_STATUS_MAP: Record<string, BookingStatusMeta> = {
  PENDING: {
    label: "Chờ xác nhận",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
  },
  CANCELLED: {
    label: "Đã hủy",
    bgClass: "bg-red-50",
    textClass: "text-red-600",
  },
};

export function getBookingStatusMeta(status: string): BookingStatusMeta {
  return (
    BOOKING_STATUS_MAP[status] ?? {
      label: status,
      bgClass: "bg-gray-100",
      textClass: "text-gray-600",
    }
  );
}
