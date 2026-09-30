import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function ClearNotificationsButton({
  onPress,
  loading,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={8}
      activeOpacity={0.7}
      className="w-10 h-10 rounded-full bg-danger-light items-center justify-center"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.danger} />
      ) : (
        <Feather name="trash-2" size={18} color={COLORS.danger} />
      )}
    </TouchableOpacity>
  );
}
