import { SessionLoadingScreen } from "@/features/auth/components/SessionLoadingScreen";
import { useSessionBootstrap } from "@/features/auth/hooks/useSessionBootstrap";
import { usePushNotifications } from "@/features/notification/hooks/usePushNotifications";
import { useUnreadCountRealtime } from "@/features/notification/hooks/useUnreadCountRealtime";
import { useAppSelector } from "@/store/hooks";
import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const user = useAppSelector((s) => s.auth.user);
  const { status, retry, finish } = useSessionBootstrap();
  const ready = status === "ready";
  usePushNotifications(ready && !!user);
  useUnreadCountRealtime(ready && !!user);

  return (
    <View style={{ flex: 1 }}>
      {/* Keep the router mounted for refresh rejection redirects, but hide guest
          content and block interaction until session restoration finishes. */}
      <View style={{ flex: 1, opacity: ready ? 1 : 0 }}
        pointerEvents={ready ? "auto" : "none"}
        accessibilityElementsHidden={!ready}
        importantForAccessibility={ready ? "auto" : "no-hide-descendants"}>
        {children}
      </View>
      {!ready && <View style={StyleSheet.absoluteFill}>
        <SessionLoadingScreen success={status === "success" || status === "routing"} onComplete={finish} error={status === "error"} onRetry={() => { void retry(); }} />
      </View>}
    </View>
  );
}

