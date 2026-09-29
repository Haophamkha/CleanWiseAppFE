// components/common/ScreenHeader.tsx
import { ROUTES } from "@/config/constants";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  disabled?: boolean;
};

export function ScreenHeader({ title, onBack, right, disabled }: Props) {
  const back =
    onBack ??
    (() => {
      if (router.canGoBack()) router.back();
      else router.replace(ROUTES.HOME);
    });

  return (
    <View className="flex-row items-center px-5 py-3 bg-surface border-b border-line">
      <TouchableOpacity
        onPress={back}
        disabled={disabled}
        hitSlop={8}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-canvas items-center justify-center mr-3"
      >
        <Feather
          name="arrow-left"
          size={20}
          color={disabled ? COLORS.inkMuted : COLORS.ink}
        />
      </TouchableOpacity>
      <Text className="flex-1 text-lg font-bold text-ink" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
