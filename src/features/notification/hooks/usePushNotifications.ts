import { useTranslation } from "react-i18next";

import { useRegisterPushTokenMutation } from "@/features/notification/api/notificationApi";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { STORAGE_KEYS } from "@/config/constants";
import { getNotificationRoute } from "@/features/notification/utils/notificationMeta";
import { storage } from "@/utils/storage";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const handledResponses = new Set<string>();

function openFromPush(response: any) {
  const id = response?.notification?.request?.identifier;

  if (id) {
    if (handledResponses.has(id)) return;
    handledResponses.add(id);
  }

  const data = response?.notification?.request?.content?.data;

  const route = getNotificationRoute({
    target: data?.target,
    type: data?.type,
    related_booking: data?.booking_id,
  });

  router.push((route ?? "/notifications") as any);
}

export function usePushNotifications(enabled: boolean) {
  const { t } = useTranslation();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [registerToken] = useRegisterPushTokenMutation();
  const registeredRef = useRef(false);

  // Đăng ký token + tạo channel
  useEffect(() => {
    if (!enabled) {
      registeredRef.current = false;
      return;
    }

    if (Platform.OS === "web" || registeredRef.current || isExpoGo) return;

    const register = async () => {
      try {
        const Device = await import("expo-device");
        const Notifications = await import("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // Tạo channel TRƯỚC khi xin quyền / lấy token (Android 13+ yêu cầu)
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: t("Thông báo chung"),
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#208AEF",
            sound: "default",
          });
        }

        if (!Device.isDevice) return;

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = tokenResponse.data;

        setExpoPushToken(token);
        await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
        registeredRef.current = true;

        await registerToken({ token, platform: Platform.OS }).unwrap();
      } catch (error) {
        if (__DEV__) {
          console.log(
            "[usePushNotifications] Bỏ qua lỗi lấy push token:",
            error,
          );
        }
      }
    };

    register();
  }, [enabled, registerToken, t]);

  // Bấm vào thông báo -> mở đúng màn hình
  useEffect(() => {
    if (!enabled || Platform.OS === "web" || isExpoGo) return;

    let cancelled = false;
    let sub: { remove: () => void } | undefined;

    (async () => {
      const Notifications = await import("expo-notifications");
      if (cancelled) return;

      // App mở từ trạng thái tắt hẳn bằng cách bấm push
      const last = await Notifications.getLastNotificationResponseAsync();
      if (last) openFromPush(last);

      sub = Notifications.addNotificationResponseReceivedListener(openFromPush);
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);

  return { expoPushToken };
}
