import { COLORS, SHADOWS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type CardProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  bg: string;
  tint: string;
  onPress?: () => void;
};

function ActionCard({ icon, title, subtitle, bg, tint, onPress }: CardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1 rounded-3xl bg-surface border border-line p-4"
      style={SHADOWS.card}
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: bg }}
      >
        <Feather name={icon} size={20} color={tint} />
      </View>
      <View className="flex-row items-center">
        <Text className="flex-1 text-[15px] font-bold text-ink">{title}</Text>
        <Feather name="chevron-right" size={16} color={COLORS.inkMuted} />
      </View>
      <Text className="text-[12px] text-ink-muted mt-0.5">{subtitle}</Text>
    </TouchableOpacity>
  );
}

export function ReviewFeedbackButtons({
  onReview,
  onFeedback,
  style,
}: {
  onReview?: () => void;
  onFeedback?: () => void;
  style?: object;
}) {
  return (
    <View className="flex-row" style={[{ gap: 12 }, style]}>
      <ActionCard
        icon="star"
        title="Đánh giá"
        subtitle="Chia sẻ trải nghiệm"
        bg={COLORS.accentLight}
        tint={COLORS.accentDark}
        onPress={onReview}
      />
      <ActionCard
        icon="alert-circle"
        title="Phản hồi"
        subtitle="Báo vấn đề phát sinh"
        bg={COLORS.dangerLight}
        tint={COLORS.danger}
        onPress={onFeedback}
      />
    </View>
  );
}
