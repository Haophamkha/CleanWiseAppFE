import { COLORS } from "@/constants/theme";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Props = { code?: string; large?: boolean };

export function BookingCodeCard({ code, large }: Props) {
  const { copied, copy } = useCopyToClipboard();

  const copyButton = (
    <TouchableOpacity
      onPress={() => copy(code)}
      activeOpacity={0.8}
      className={`flex-row items-center h-10 px-4 rounded-full ${
        copied ? "bg-primary" : large ? "bg-surface" : "bg-primary-light"
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
  );

  if (!large) {
    return (
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            Mã đơn hàng
          </Text>
          <Text
            selectable
            numberOfLines={1}
            className="font-extrabold mt-0.5 text-base text-ink"
            style={{ letterSpacing: 1 }}
          >
            {code}
          </Text>
        </View>
        {copyButton}
      </View>
    );
  }

  return (
    <View className="mb-4 flex-row items-center rounded-3xl bg-primary-soft border border-primary-border p-4">
      <View className="w-12 h-12 rounded-2xl bg-primary-light items-center justify-center mr-3">
        <Feather name="hash" size={20} color={COLORS.primaryDark} />
      </View>
      <View className="flex-1 mr-3">
        <Text
          className="text-[11px] font-bold uppercase text-ink-muted"
          style={{ letterSpacing: 1 }}
        >
          Mã đơn hàng
        </Text>
        <Text
          selectable
          numberOfLines={1}
          className="text-[20px] font-extrabold text-primary mt-0.5"
          style={{ letterSpacing: 1.2 }}
        >
          {code}
        </Text>
      </View>
      {copyButton}
    </View>
  );
}
