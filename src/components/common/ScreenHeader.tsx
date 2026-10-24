import { useAppTheme } from "@/features/theme/ThemeProvider";
// components/common/ScreenHeader.tsx
import { ROUTES } from "@/config/constants";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  disabled?: boolean;
  minimal?: boolean;
};

export function ScreenHeader({ title, onBack, right, disabled, minimal = false }: Props) {
  const { COLORS } = useAppTheme();

  const back =
    onBack ??
    (() => {
      if (router.canGoBack()) router.back();
      else router.replace(ROUTES.HOME);
    });

  return (
    <View className={`flex-row items-center px-5 py-3 ${minimal ? "bg-canvas" : "bg-surface border-b border-line"}`}>
      <TouchableOpacity
        onPress={back}
        disabled={disabled}
        hitSlop={8}
        activeOpacity={0.7}
        className={`w-10 h-10 items-center justify-center mr-3 ${minimal ? "rounded-xl bg-surface-muted" : "rounded-full bg-canvas"}`}
        style={minimal ? { borderRadius: 12 } : undefined}
      >
        <Feather
          name="arrow-left"
          size={20}
          color={minimal || disabled ? COLORS.inkMuted : COLORS.ink}
        />
      </TouchableOpacity>
      <Text className={`flex-1 font-bold text-ink ${minimal ? "text-[22px]" : "text-lg"}`} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
