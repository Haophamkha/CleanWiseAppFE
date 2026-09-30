import { useClearAllNotificationsMutation } from "@/features/notification/api/notificationApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Alert } from "react-native";

export function useClearNotifications(onDone?: () => void) {
  const [clearAll, { isLoading }] = useClearAllNotificationsMutation();

  const confirmClear = () =>
    Alert.alert(
      "Xoá tất cả thông báo",
      "Toàn bộ thông báo sẽ bị xoá vĩnh viễn và không thể khôi phục.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAll().unwrap();
              showSuccessToast("Đã xoá tất cả thông báo");
              onDone?.();
            } catch (e) {
              showErrorToast(
                "Không thể xoá thông báo",
                getApiErrorMessage(e, "Vui lòng thử lại."),
              );
            }
          },
        },
      ],
    );

  return { confirmClear, isClearing: isLoading };
}
