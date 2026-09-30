import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { FeatherName } from "../../../components/ui/Input";

type Props = {
  icon: FeatherName;
  text: string;
  error?: boolean;
  isLast?: boolean;
};

export function IconRow({ icon, text, error, isLast }: Props) {
  return (
    <View className={`flex-row items-center ${isLast ? "" : "mb-3"}`}>
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          error ? "bg-danger-light" : "bg-primary-light"
        }`}
      >
        <Feather
          name={icon}
          size={17}
          color={error ? COLORS.danger : COLORS.primaryDark}
        />
      </View>
      <Text
        className={`flex-1 text-[14px] ${error ? "text-danger" : "text-ink"}`}
      >
        {text}
      </Text>
    </View>
  );
}
