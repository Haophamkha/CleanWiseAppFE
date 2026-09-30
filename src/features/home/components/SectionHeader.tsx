import { Text, TouchableOpacity, View } from "react-native";

type Props = { title: string; onSeeAll?: () => void };

export function SectionHeader({ title, onSeeAll }: Props) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-xl font-bold text-ink">{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
          <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
