import { Text, View } from "react-native";

type Tone = "primary" | "success" | "danger" | "accent" | "neutral";

const BOX: Record<Tone, string> = {
  primary: "bg-primary-light",
  success: "bg-success-light",
  danger: "bg-danger-light",
  accent: "bg-accent-light",
  neutral: "bg-canvas",
};
const LABEL: Record<Tone, string> = {
  primary: "text-primary-dark",
  success: "text-success",
  danger: "text-danger",
  accent: "text-accent-dark",
  neutral: "text-ink-soft",
};

export function Badge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${BOX[tone]}`}>
      <Text className={`text-xs font-bold ${LABEL[tone]}`}>{label}</Text>
    </View>
  );
}
