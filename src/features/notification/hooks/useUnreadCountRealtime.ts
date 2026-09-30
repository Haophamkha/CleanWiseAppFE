import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { notificationApi } from "@/features/notification/api/notificationApi";
import { setUnreadCount } from "@/features/notification/stores/notificationSlice";
import { useAppDispatch } from "@/store/hooks";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

export function useUnreadCountRealtime(enabled: boolean) {
  const dispatch = useAppDispatch();

  // Đồng bộ lại từ server: lúc socket kết nối lại và lúc app quay về foreground
  const resync = useCallback(() => {
    dispatch(
      notificationApi.util.invalidateTags([
        { type: "Notifications", id: "COUNT" },
      ]),
    );
  }, [dispatch]);

  useChatSocket(
    enabled,
    (event) => {
      if (
        event.type === "notification.unread" &&
        typeof event.unread_count === "number"
      ) {
        dispatch(setUnreadCount(event.unread_count));
        // màn danh sách đang mở thì tự tải lại
        dispatch(
          notificationApi.util.invalidateTags([
            { type: "Notifications", id: "LIST" },
          ]),
        );
      }
    },
    resync,
  );

  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") resync();
    });
    return () => sub.remove();
  }, [enabled, resync]);
}
