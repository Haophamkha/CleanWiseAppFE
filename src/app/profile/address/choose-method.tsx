// app/profile/address/choose-method.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { Card, type FeatherName } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

function MethodCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: FeatherName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center mr-4">
          <Feather name={icon} size={22} color={COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-ink mb-0.5">{title}</Text>
          <Text className="text-sm text-ink-soft">{description}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.inkMuted} />
      </Card>
    </TouchableOpacity>
  );
}

export default function ChooseAddressMethodScreen() {
  const { pickerKey } = useLocalSearchParams<{ pickerKey?: string }>();
  const params = pickerKey ? { pickerKey } : {};

  return (
    <ScreenContainer>
      <ScreenHeader title="Chọn địa chỉ mới" />

      <View className="flex-1 px-5 pt-6" style={{ gap: 16 }}>
        <MethodCard
          icon="map-pin"
          title="Chọn trên bản đồ"
          description="Ghim vị trí, hệ thống tự điền địa chỉ giúp bạn"
          onPress={() =>
            router.push({
              pathname: "/profile/address/select-location",
              params,
            })
          }
        />
        <MethodCard
          icon="edit-3"
          title="Nhập thủ công"
          description="Tự chọn tỉnh/thành, phường/xã và nhập địa chỉ"
          onPress={() =>
            router.push({ pathname: "/profile/address/add", params })
          }
        />
      </View>
    </ScreenContainer>
  );
}
