import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export function ReviewStars({
  rating,
  onChange,
  disabled = false,
}: {
  rating: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row" accessibilityLabel={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          disabled={!onChange || disabled}
          onPress={() => onChange?.(value)}
          accessibilityRole={onChange ? "button" : undefined}
          accessibilityLabel={`${value} sao`}
          accessibilityState={{ selected: value === rating, disabled }}
          className={onChange ? "p-2" : "mr-1"}
        >
          <Feather
            name="star"
            size={onChange ? 30 : 16}
            color={value <= rating ? COLORS.accent : COLORS.line}
          />
        </Pressable>
      ))}
    </View>
  );
}
