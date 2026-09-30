// components/common/RequireLoginNotice.tsx
import { Button } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  message?: string;
};

export function RequireLoginNotice({
  message = "Đăng nhập để xem đầy đủ thông tin của bạn",
}: Props) {
  return (
    <View className="bg-surface rounded-xl border border-line items-center px-6 py-7 mb-5">
      <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center mb-4">
        <Feather name="user" size={26} color={COLORS.primary} />
      </View>
      <Text className="text-lg font-bold text-ink mb-1">
        Bạn chưa đăng nhập
      </Text>
      <Text className="text-sm text-ink-soft text-center leading-5">
        {message}
      </Text>

      <View className="flex-row w-full mt-6" style={{ gap: 12 }}>
        <TouchableOpacity
          className="flex-1 rounded-xl py-3.5 items-center justify-center bg-primary-soft border border-primary-border"
          onPress={() => router.push(ROUTES.REGISTER as any)}
          activeOpacity={0.8}
        >
          <Text className="font-semibold text-sm text-primary-dark">
            Đăng ký
          </Text>
        </TouchableOpacity>
        <Button
          title="Đăng nhập"
          onPress={() => router.push(ROUTES.LOGIN as any)}
          className="flex-1"
        />
      </View>
    </View>
  );
}
