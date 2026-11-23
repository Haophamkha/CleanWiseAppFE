import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert as NativeAlert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type AlertButton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
};
export type AlertOptions = { cancelable?: boolean; onDismiss?: () => void };

type Item = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
};

let push: ((item: Item) => void) | null = null;

// Drop-in replacement for react-native Alert: same Alert.alert(...) signature,
// but rendered with the app theme. Falls back to the native alert if the host is not mounted.
export const Alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    const list = buttons?.length ? buttons : [{ text: t("OK") }];
    if (push) push({ title, message, buttons: list, options });
    else NativeAlert.alert(title, message, buttons as any, options as any);
  },
};

export function AlertHost() {
  const { COLORS, SHADOWS, OVERLAY } = useAppTheme();
  const [queue, setQueue] = useState<Item[]>([]);
  const [shown, setShown] = useState<Item | undefined>(undefined);
  const anim = useRef(new Animated.Value(0)).current;
  const current = queue[0];
  const item = current ?? shown;

  useEffect(() => {
    push = (next) => setQueue((q) => [...q, next]);
    return () => {
      push = null;
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    setShown(current);
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [current, anim]);

  if (!item) return null;

  const buttons = item.buttons;
  const cancelButton = buttons.find((b) => b.style === "cancel");
  const dismissable = !!current && (!!item.options?.cancelable || !!cancelButton);
  const destructive = buttons.some((b) => b.style === "destructive");
  const row = buttons.length === 2;

  const tone = destructive
    ? { icon: "alert-triangle" as const, color: COLORS.danger, tint: COLORS.dangerLight }
    : buttons.length === 1
      ? { icon: "info" as const, color: COLORS.info, tint: COLORS.infoLight }
      : { icon: "help-circle" as const, color: COLORS.primary, tint: COLORS.primaryLight };

  const close = (button?: AlertButton) => {
    setQueue((q) => q.slice(1));
    button?.onPress?.();
  };
  const dismiss = () => {
    if (!dismissable) return;
    setQueue((q) => q.slice(1));
    if (cancelButton) cancelButton.onPress?.();
    else item.options?.onDismiss?.();
  };

  return (
    <Modal
      visible={!!current}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <Pressable
        onPress={dismiss}
        style={{
          flex: 1,
          backgroundColor: OVERLAY,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
        }}
      >
        <Animated.View
          style={{
            width: "100%",
            maxWidth: 340,
            opacity: anim,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              {
                borderRadius: 28,
                paddingTop: 26,
                paddingBottom: 18,
                paddingHorizontal: 22,
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: COLORS.line,
              },
              SHADOWS.float,
            ]}
          >
            <View
              style={{
                alignSelf: "center",
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: tone.tint,
              }}
            >
              <Feather name={tone.icon} size={26} color={tone.color} />
            </View>

            <Text
              style={{
                marginTop: 16,
                fontSize: 17,
                fontWeight: "800",
                textAlign: "center",
                color: COLORS.ink,
              }}
            >
              {item.title}
            </Text>

            {!!item.message && (
              <ScrollView
                style={{ maxHeight: 220, marginTop: 8 }}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 21,
                    textAlign: "center",
                    color: COLORS.inkSoft,
                  }}
                >
                  {item.message}
                </Text>
              </ScrollView>
            )}

            <View
              style={{
                flexDirection: row ? "row" : "column",
                marginTop: 22,
                gap: 10,
              }}
            >
              {buttons.map((b, i) => {
                const isCancel = b.style === "cancel";
                const isDanger = b.style === "destructive";
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => close(b)}
                    activeOpacity={0.85}
                    style={{
                      flex: row ? 1 : undefined,
                      height: 48,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 16,
                      backgroundColor: isCancel
                        ? COLORS.canvas
                        : isDanger
                          ? COLORS.dangerFill
                          : COLORS.primaryFill,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14.5,
                        fontWeight: "800",
                        color: isCancel ? COLORS.inkSoft : COLORS.white,
                      }}
                    >
                      {b.text ?? t("OK")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}