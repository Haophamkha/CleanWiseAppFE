import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Button } from "./Button";
import type { FeatherName } from "./Input";

type Props = {
  icon?: FeatherName;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "inbox",
  title,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="items-center justify-center py-10 px-6">
      <View className="w-14 h-14 rounded-full bg-primary-light items-center justify-center mb-3">
        <Feather name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text className="text-sm text-ink-soft text-center">{title}</Text>
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="soft"
          onPress={onAction}
          className="mt-4"
        />
      ) : null}
    </View>
  );
}
