import { ConfirmProvider } from "@/components/common/ConfirmProvider";
import { SuccessSheetProvider } from "@/components/common/SuccessSheet";
import { STORAGE_KEYS } from "@/config/constants";
import { AppToast } from "@/config/toastConfig";
import { useGetProfileQuery } from "@/features/auth/api/authApi";
import { usePushNotifications } from "@/features/notification/hooks/usePushNotifications";
import { useUnreadCountRealtime } from "@/features/notification/hooks/useUnreadCountRealtime";
import { registerAuthDispatch } from "@/store/baseApi";
import { useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";
import { storage } from "@/utils/storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";

registerAuthDispatch(store.dispatch);

function AuthInit() {
  const user = useAppSelector((s) => s.auth.user);
  const [needBootstrap, setNeedBootstrap] = useState(false);

  useEffect(() => {
    storage.getItem(STORAGE_KEYS.ACCESS_TOKEN).then((t) => {
      if (t && t !== "null" && t !== "undefined") setNeedBootstrap(true);
    });
  }, []);

  useEffect(() => {
    if (user) setNeedBootstrap(false);
  }, [user]);

  useGetProfileQuery(undefined, { skip: !needBootstrap });
  usePushNotifications(!!user);
  useUnreadCountRealtime(!!user);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ConfirmProvider>
          <SuccessSheetProvider>
            <AuthInit />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <AppToast />
          </SuccessSheetProvider>
        </ConfirmProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
