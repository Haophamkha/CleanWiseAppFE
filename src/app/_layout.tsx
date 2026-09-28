import { ConfirmProvider } from "@/components/common/ConfirmProvider";
import { STORAGE_KEYS } from "@/config/constants";
import { toastConfig } from "@/config/toastConfig";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useGetProfileQuery } from "@/services/authApi";
import { registerAuthDispatch } from "@/store/baseApi";
import { useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";
import { storage } from "@/utils/storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

// Đăng ký ngay khi module load, trước mọi request
registerAuthDispatch(store.dispatch);

function AuthInit() {
  const user = useAppSelector((s) => s.auth.user);
  const [needBootstrap, setNeedBootstrap] = useState(false);

  // Mở app: nếu có token thì nạp profile (getProfile tự setUser).
  // Token hết hạn sẽ được refresh tự động; refresh bị từ chối thì logout.
  useEffect(() => {
    storage.getItem(STORAGE_KEYS.ACCESS_TOKEN).then((t) => {
      if (t && t !== "null" && t !== "undefined") setNeedBootstrap(true);
    });
  }, []);

  useEffect(() => {
    if (user) setNeedBootstrap(false); // đã có user, không gọi lại
  }, [user]);

  useGetProfileQuery(undefined, { skip: !needBootstrap });
  usePushNotifications(!!user);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ConfirmProvider>
          <AuthInit />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <Toast config={toastConfig} />
        </ConfirmProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
