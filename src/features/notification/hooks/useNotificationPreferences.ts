import {
    useGetNotificationPreferencesQuery,
    useUpdateNotificationPreferencesMutation,
} from "@/features/notification/api/notificationApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { showErrorToast } from "@/utils/toast";

export function useNotificationPreferences(enabled: boolean) {
  const { data, isLoading } = useGetNotificationPreferencesQuery(undefined, {
    skip: !enabled,
  });
  const [update] = useUpdateNotificationPreferencesMutation();

  const setPushEnabled = async (value: boolean) => {
    try {
      await update({ push_enabled: value }).unwrap();
    } catch (e) {
      showErrorToast(
        "Không thể lưu cài đặt",
        getApiErrorMessage(e, "Vui lòng thử lại."),
      );
    }
  };

  return {
    pushEnabled: data?.push_enabled ?? true,
    isLoading,
    setPushEnabled,
  };
}
