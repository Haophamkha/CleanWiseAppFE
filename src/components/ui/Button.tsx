import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type Variant = "primary" | "soft" | "outline" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const BOX: Record<Variant, string> = {
  primary: "bg-primary",
  soft: "bg-primary-light",
  outline: "bg-surface border border-line",
  danger: "bg-danger",
};
const LABEL: Record<Variant, string> = {
  primary: "text-white",
  soft: "text-primary-dark",
  outline: "text-ink",
  danger: "text-white",
};
const TINT: Record<Variant, string> = {
  primary: COLORS.white,
  soft: COLORS.primaryDark,
  outline: COLORS.ink,
  danger: COLORS.white,
};

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  className = "",
}: Props) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.85}
      className={`flex-row items-center justify-center rounded-full py-3.5 px-6 ${BOX[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={variant === "primary" && !inactive ? SHADOWS.float : undefined}
    >
      {loading ? (
        <ActivityIndicator color={TINT[variant]} />
      ) : (
        <>
          {icon && <Feather name={icon} size={17} color={TINT[variant]} />}
          <Text
            className={`text-base font-bold ${LABEL[variant]} ${icon ? "ml-2" : ""}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
