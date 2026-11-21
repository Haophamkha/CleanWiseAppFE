import { ConfirmProvider } from "@/components/common/ConfirmProvider";
import { SuccessSheetProvider } from "@/components/common/SuccessSheet";
import { AppToast } from "@/config/toastConfig";
import { SessionBootstrap } from "@/features/auth/components/SessionBootstrap";
import { AppLanguageProvider } from "@/features/language/LanguageProvider";
import { AppThemeProvider } from "@/features/theme/ThemeProvider";
import { registerAuthDispatch } from "@/store/baseApi";
import { store } from "@/store/store";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import "../global.css";

registerAuthDispatch(store.dispatch);
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppLanguageProvider>
          <AppThemeProvider>
            <ConfirmProvider>
              <SuccessSheetProvider>
                <SessionBootstrap>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                </SessionBootstrap>
                <AppToast />
              </SuccessSheetProvider>
            </ConfirmProvider>
          </AppThemeProvider>
        </AppLanguageProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
