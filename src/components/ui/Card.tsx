import { useAppTheme } from "@/features/theme/ThemeProvider";

import { View, ViewProps } from "react-native";

export function Card({
  style,
  className = "",
  ...rest
}: ViewProps & { className?: string }) {
  const { SHADOWS } = useAppTheme();

  return (
    <View
      className={`bg-surface rounded-xl border border-line p-4 ${className}`}
      style={[SHADOWS.card, style]}
      {...rest}
    />
  );
}
