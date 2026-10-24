import { useTranslation } from "react-i18next";

import { useClearAllNotificationsMutation } from "@/features/notification/api/notificationApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Alert } from "react-native";

export function useClearNotifications(onDone?: () => void) {
  const { t } = useTranslation();

  const [clearAll, { isLoading }] = useClearAllNotificationsMutation();

  const confirmClear = () =>
    Alert.alert(
      t("Xoá tất cả thông báo"),
      t("Toàn bộ thông báo sẽ bị xoá vĩnh viễn và không thể khôi phục."),
      [
        { text: t("Huỷ"), style: "cancel" },
        {
          text: t("Xoá tất cả"),
          style: "destructive",
          onPress: async () => {
            try {
              await clearAll().unwrap();
              showSuccessToast(t("Đã xoá tất cả thông báo"));
              onDone?.();
            } catch (e) {
              showErrorToast(
                t("Không thể xoá thông báo"),
                getApiErrorMessage(e, t("Vui lòng thử lại.")),
              );
            }
          },
        },
      ],
    );

  return { confirmClear, isClearing: isLoading };
}
