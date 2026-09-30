import { Image, Text, TouchableOpacity } from "react-native";

type Props = { onPress: () => void; disabled?: boolean; loading?: boolean };

export function GoogleButton({ onPress, disabled, loading }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`flex-row items-center justify-center rounded-full border border-line bg-surface py-3.5 ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      <Image
        source={require("../../../../assets/icon/google.png")}
        style={{ width: 18, height: 18, marginRight: 10 }}
      />
      <Text className="text-base font-medium text-ink">
        {loading ? "Đang đăng nhập..." : "Google"}
      </Text>
    </TouchableOpacity>
  );
}
