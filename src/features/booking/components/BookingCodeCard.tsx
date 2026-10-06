import { COLORS, SHADOWS } from "@/constants/theme";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Feather } from "@expo/vector-icons";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type Props = { code?: string; large?: boolean };

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export function BookingCodeCard({ code, large }: Props) {
  const { copied, copy } = useCopyToClipboard();

  const copyButton = (
    <TouchableOpacity
      onPress={() => copy(code)}
      activeOpacity={0.7}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Sao chép mã đơn"
      className="items-center justify-center rounded-full"
      style={{
        width: 40,
        height: 40,
        backgroundColor: copied ? COLORS.successLight : COLORS.canvas,
        borderWidth: 1,
        borderColor: copied ? COLORS.success : COLORS.line,
      }}
    >
      <Feather
        name={copied ? "check" : "copy"}
        size={16}
        color={copied ? COLORS.success : COLORS.inkSoft}
      />
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
            className="font-extrabold mt-0.5 text-base text-ink"
            style={{ fontFamily: MONO, letterSpacing: 0.8 }}
          >
            {code}
          </Text>
        </View>
        {copyButton}
      </View>
    );
  }

  return (
    <View
      className="mb-4 flex-row items-center rounded-3xl bg-surface border border-line p-4"
      style={SHADOWS.card}
    >
      <View className="w-11 h-11 rounded-2xl bg-canvas items-center justify-center mr-3">
        <Feather name="hash" size={18} color={COLORS.inkSoft} />
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
          className="text-[19px] font-extrabold text-ink mt-0.5"
          style={{ fontFamily: MONO, letterSpacing: 0.8 }}
        >
          {code}
        </Text>
      </View>
      {copyButton}
    </View>
  );
}
