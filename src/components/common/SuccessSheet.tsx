import { COLORS, RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Modal, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];

export type SuccessSheetConfig = {
  title: string;
  message?: string;
  icon?: FeatherIcon;
  onClose?: () => void;
  /** Tự đóng sau N ms (mặc định 3000) */
  autoCloseMs?: number;
};

type Ctx = { show: (c: SuccessSheetConfig) => void; hide: () => void };
const SuccessSheetContext = createContext<Ctx | null>(null);

export function useSuccessSheet() {
  const ctx = useContext(SuccessSheetContext);
  if (!ctx)
    throw new Error("useSuccessSheet phải nằm trong SuccessSheetProvider");
  return ctx;
}

/* ---- confetti ---- */
const CONFETTI_COLORS = [
  COLORS.primary,
  COLORS.accent,
  COLORS.success,
  COLORS.info,
  COLORS.danger,
];
const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const dist = 62 + (i % 3) * 16;
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    w: 5 + (i % 3) * 2,
    h: i % 2 === 0 ? 5 + (i % 3) * 2 : 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    spin: (i % 2 === 0 ? 1 : -1) * (180 + i * 20),
  };
});

const OFFSET = 520;
const DEFAULT_AUTO_CLOSE_MS = 3000;

export function SuccessSheetProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<SuccessSheetConfig | null>(null);
  const configRef = useRef<SuccessSheetConfig | null>(null);
  const closing = useRef(false);

  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(OFFSET)).current;
  const check = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  const DEFAULT_AUTO_CLOSE_MS = 2000;

  const hide = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: OFFSET,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const c = configRef.current;
      configRef.current = null;
      setConfig(null);
      closing.current = false;
      c?.onClose?.();
    });
  }, [backdrop, sheetY]);

  const show = useCallback(
    (c: SuccessSheetConfig) => {
      backdrop.setValue(0);
      sheetY.setValue(OFFSET);
      check.setValue(0);
      halo.setValue(0);
      burst.setValue(0);
      closing.current = false;
      configRef.current = c;
      setConfig(c);
    },
    [backdrop, sheetY, check, halo, burst],
  );

  useEffect(() => {
    if (!config) return;

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(sheetY, {
        toValue: 0,
        damping: 18,
        stiffness: 140,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(220),
        Animated.parallel([
          Animated.spring(check, {
            toValue: 1,
            damping: 9,
            stiffness: 160,
            useNativeDriver: true,
          }),
          Animated.timing(halo, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(burst, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Luôn tự đóng (mặc định 3s)
    const t = setTimeout(hide, config.autoCloseMs ?? DEFAULT_AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [config, backdrop, sheetY, check, halo, burst, hide]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <SuccessSheetContext.Provider value={value}>
      {children}

      <Modal
        visible={!!config}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hide}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(5,20,15,0.55)",
              opacity: backdrop,
            }}
          />

          <Animated.View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              paddingHorizontal: 24,
              paddingTop: 36,
              paddingBottom: Math.max(insets.bottom, 16) + 24,
              alignItems: "center",
              transform: [{ translateY: sheetY }],
            }}
          >
            {/* check + halo + confetti */}
            <View
              style={{
                width: 120,
                height: 120,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  backgroundColor: COLORS.successLight,
                  opacity: halo,
                  transform: [
                    {
                      scale: halo.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                }}
              />

              {PARTICLES.map((p, i) => (
                <Animated.View
                  key={i}
                  style={{
                    position: "absolute",
                    width: p.w,
                    height: p.h,
                    borderRadius: 2,
                    backgroundColor: p.color,
                    opacity: burst.interpolate({
                      inputRange: [0, 0.15, 0.75, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateX: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, p.dx],
                        }),
                      },
                      {
                        translateY: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, p.dy],
                        }),
                      },
                      {
                        rotate: burst.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", `${p.spin}deg`],
                        }),
                      },
                    ],
                  }}
                />
              ))}

              <Animated.View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: COLORS.success,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale: check }],
                }}
              >
                <Feather
                  name={config?.icon ?? "check"}
                  size={36}
                  color={COLORS.white}
                />
              </Animated.View>
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: COLORS.ink,
                textAlign: "center",
              }}
            >
              {config?.title}
            </Text>
            {config?.message ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 21,
                  color: COLORS.inkSoft,
                  textAlign: "center",
                }}
              >
                {config.message}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    </SuccessSheetContext.Provider>
  );
}
