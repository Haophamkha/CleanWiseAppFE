// src/features/favorite-worker/components/FavoriteHeartButton.tsx
import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, TouchableOpacity } from "react-native";

type Props = {
  liked: boolean;
  loading?: boolean;
  onPress: () => void;
  size?: number;
};

export function FavoriteHeartButton({
  liked,
  loading = false,
  onPress,
  size = 44,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.25,
        useNativeDriver: true,
        speed: 40,
        bounciness: 12,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
    ]).start();
  }, [liked, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.33,
          borderWidth: liked ? 0 : 1.5,
          borderColor: COLORS.line,
          backgroundColor: liked ? COLORS.danger : COLORS.surface,
        }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={liked ? COLORS.white : COLORS.danger}
          />
        ) : (
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={size * 0.44}
            color={liked ? COLORS.white : COLORS.inkMuted}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
