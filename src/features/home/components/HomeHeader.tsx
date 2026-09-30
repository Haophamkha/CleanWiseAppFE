import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { GradientHeader } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type Props = {
  isAuthenticated: boolean;
  name: string;
  query: string;
  onChangeQuery: (v: string) => void;
};

export function HomeHeader({
  isAuthenticated,
  name,
  query,
  onChangeQuery,
}: Props) {
  return (
    <GradientHeader>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-sm text-ink-soft">
            {isAuthenticated ? "Xin chào 👋" : "Chào mừng bạn đến với"}
          </Text>
          <Text
            className="text-2xl font-bold text-ink"
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {isAuthenticated ? name : "CleanWise"}
          </Text>
        </View>
        {isAuthenticated ? (
          <View className="w-11 h-11 rounded-full bg-surface items-center justify-center">
            <NotificationBellButton />
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center bg-surface rounded-full px-4 py-3 mt-5">
        <Feather name="search" size={18} color={COLORS.inkMuted} />
        <TextInput
          className="flex-1 ml-3 text-base text-ink"
          placeholder="Tìm dịch vụ dọn dẹp..."
          placeholderTextColor={COLORS.inkMuted}
          value={query}
          onChangeText={onChangeQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => onChangeQuery("")} hitSlop={8}>
            <Feather name="x-circle" size={18} color={COLORS.inkMuted} />
          </TouchableOpacity>
        )}
      </View>
    </GradientHeader>
  );
}
