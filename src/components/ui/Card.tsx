import { COLORS } from "@/constants/theme";
import { View, ViewProps } from "react-native";

export function Card({
  style,
  className = "",
  ...rest
}: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface rounded-xl border border-line p-4 ${className}`}
      style={[
        {
          shadowColor: COLORS.ink,
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    />
  );
}
