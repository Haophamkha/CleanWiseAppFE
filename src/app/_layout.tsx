import { toastConfig } from "@/config/toastConfig";
import { store } from "@/store/store";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast config={toastConfig} />
      </Provider>
    </SafeAreaProvider>
  );
}
