import { COLORS } from "@/constants/theme";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = { code?: string; large?: boolean };

export function BookingCodeCard({ code, large }: Props) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-3">
        <Text className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          Mã đơn hàng
        </Text>
        <Text
          selectable
          numberOfLines={1}
          className={`font-extrabold mt-0.5 ${
            large ? "text-[22px] text-primary" : "text-base text-ink"
          }`}
          style={{ letterSpacing: 1 }}
        >
          {code}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => copy(code)}
        activeOpacity={0.8}
        className={`flex-row items-center h-10 px-4 rounded-full ${
          copied ? "bg-primary" : "bg-primary-light"
        }`}
      >
        <Feather
          name={copied ? "check" : "copy"}
          size={14}
          color={copied ? COLORS.white : COLORS.primaryDark}
        />
        <Text
          className={`ml-1.5 text-xs font-bold ${
            copied ? "text-white" : "text-primary-dark"
          }`}
        >
          {copied ? "Đã chép" : "Sao chép"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
