import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];

/* ------------------------------------------------------------------ */
/* AuthScreen: nền + nút back + badge + tiêu đề căn giữa + footer đáy   */
/* ------------------------------------------------------------------ */
type AuthScreenProps = {
  icon: FeatherIcon;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthScreen({
  icon,
  title,
  subtitle,
  onBack,
  footer,
  children,
}: AuthScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 48, justifyContent: "center" }}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                activeOpacity={0.7}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.surface,
                  borderWidth: 1,
                  borderColor: COLORS.line,
                }}
              >
                <Feather name="chevron-left" size={20} color={COLORS.ink} />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{ alignItems: "center", marginTop: 8, marginBottom: 28 }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: COLORS.primarySoft,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Feather name={icon} size={36} color={COLORS.primary} />
            </View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: COLORS.ink,
                textAlign: "center",
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 21,
                  color: COLORS.inkSoft,
                  textAlign: "center",
                  paddingHorizontal: 12,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          {children}

          <View style={{ flex: 1, justifyContent: "flex-end", paddingTop: 24 }}>
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* PillInput: ô nhập bo tròn, icon trái, mắt ẩn/hiện mật khẩu           */
/* ------------------------------------------------------------------ */
type PillInputProps = TextInputProps & {
  icon?: FeatherIcon;
  password?: boolean;
  invalid?: boolean;
};

export function PillInput({
  icon,
  password,
  invalid,
  style,
  onFocus,
  onBlur,
  ...rest
}: PillInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = invalid
    ? COLORS.danger
    : focused
      ? COLORS.primary
      : COLORS.line;

  return (
    <View
      style={{
        height: 56,
        borderRadius: 28,
        paddingHorizontal: 18,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor,
      }}
    >
      {icon && (
        <Feather
          name={icon}
          size={18}
          color={focused ? COLORS.primary : COLORS.inkMuted}
        />
      )}
      <TextInput
        {...rest}
        secureTextEntry={password ? hidden : rest.secureTextEntry}
        placeholderTextColor={COLORS.inkMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            flex: 1,
            marginLeft: icon ? 12 : 0,
            fontSize: 15,
            color: COLORS.ink,
            height: "100%",
          },
          style,
        ]}
      />
      {password && (
        <TouchableOpacity
          onPress={() => setHidden((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name={hidden ? "eye-off" : "eye"}
            size={18}
            color={COLORS.inkMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PillButton: nút chính (đổ bóng) và nút viền                          */
/* ------------------------------------------------------------------ */
type PillButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  left?: ReactNode;
};

export function PillButton({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  left,
}: PillButtonProps) {
  const isPrimary = variant === "primary";
  const off = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
      style={[
        {
          height: 56,
          borderRadius: 28,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: off ? 0.6 : 1,
        },
        isPrimary
          ? { backgroundColor: COLORS.primary, ...SHADOWS.float }
          : {
              backgroundColor: COLORS.surface,
              borderWidth: 1.5,
              borderColor: COLORS.line,
            },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} />
      ) : (
        <>
          {left}
          <Text
            style={{
              marginLeft: left ? 10 : 0,
              fontSize: 16,
              fontWeight: "600",
              color: isPrimary ? COLORS.white : COLORS.ink,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* OrDivider                                                            */
/* ------------------------------------------------------------------ */
export function OrDivider({ label = "Hoặc" }: { label?: string }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginVertical: 18 }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.line }} />
      <Text
        style={{ marginHorizontal: 12, fontSize: 13, color: COLORS.inkMuted }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.line }} />
    </View>
  );
}
