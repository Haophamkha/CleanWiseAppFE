import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";

export function GuestBanner() {
  return (
    <Card className="mb-6">
      <View className="flex-row items-center mb-4">
        <View className="w-11 h-11 rounded-full bg-primary-light items-center justify-center mr-3">
          <Feather name="user" size={20} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">
            Đăng nhập để đặt lịch
          </Text>
          <Text className="text-sm text-ink-soft">
            Theo dõi đơn hàng và nhận ưu đãi dành riêng cho bạn.
          </Text>
        </View>
      </View>
      <View className="flex-row" style={{ gap: 12 }}>
        <Button
          title="Đăng nhập"
          onPress={() => router.push(ROUTES.LOGIN as any)}
          className="flex-1"
        />
        <Button
          title="Đăng ký"
          variant="outline"
          onPress={() => router.push(ROUTES.REGISTER as any)}
          className="flex-1"
        />
      </View>
    </Card>
  );
}
