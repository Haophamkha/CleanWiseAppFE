import { Card } from "@/components/ui";
import { ROUTES } from "@/config/constants";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

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

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.push(ROUTES.LOGIN as any)}
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            backgroundColor: COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 15 }}
          >
            Đăng nhập
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.REGISTER as any)}
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: COLORS.primary,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: COLORS.primary, fontWeight: "600", fontSize: 15 }}
          >
            Đăng ký
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
