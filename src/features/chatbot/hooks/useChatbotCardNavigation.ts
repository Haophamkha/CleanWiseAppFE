import { useLazyGetBookingDetailQuery } from "@/features/booking/api/bookingApi";
import { showErrorToast } from "@/utils/toast";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import type { ChatbotCard } from "../types/chatbot";

export function useChatbotCardNavigation() {
  const [getBooking] = useLazyGetBookingDetailQuery();
  const [opening, setOpening] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const openCard = async (card: ChatbotCard) => {
    if (busy.current) return;
    if (card.type === "help" && card.action === "OPEN_HELP_ARTICLE" && card.article_id > 0) {
      router.push({ pathname: "/help/[id]", params: { id: String(card.article_id) } });
      return;
    }
    if (
      card.action === "OPEN_SERVICE" &&
      card.type === "service" &&
      card.service_id > 0
    ) {
      router.push({
        pathname: "/services/[id]",
        params: { id: String(card.service_id) },
      });
    } else if (
      card.action === "OPEN_BOOKING" &&
      card.type === "booking" &&
      card.booking_id > 0
    ) {
      router.push({
        pathname: "/booking/[id]",
        params: { id: String(card.booking_id) },
      });
    } else if (
      card.action === "OPEN_SCHEDULE" &&
      card.type === "schedule" &&
      card.booking_id > 0 &&
      card.schedule_id > 0
    ) {
      busy.current = true;
      setOpening(`schedule:${card.schedule_id}`);
      try {
        // Existing schedule screen requires a full booking schedule projection.
        // Fetch fresh authorized data instead of passing the chatbot summary.
        const booking = await getBooking(card.booking_id, false).unwrap();
        if (!mounted.current) return;
        const schedule = booking.schedules.find(
          (item) => item.id === card.schedule_id,
        );
        if (!schedule) throw new Error("Schedule unavailable");
        router.push({
          pathname: "/booking/schedule/[id]",
          params: {
            id: String(schedule.id),
            bookingId: String(booking.id),
            bookingStatus: booking.status,
            data: JSON.stringify(schedule),
          },
        });
      } catch {
        if (mounted.current) {
          showErrorToast(
            "Không mở được buổi dịch vụ",
            "Vui lòng kiểm tra kết nối và thử lại.",
          );
        }
      } finally {
        busy.current = false;
        if (mounted.current) setOpening(null);
      }
    }
  };
  return { openCard, opening };
}
