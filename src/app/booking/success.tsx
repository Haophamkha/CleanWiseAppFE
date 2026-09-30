import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";
import { BookingCodeCard } from "@/features/booking/components/BookingCodeCard";
import { IconRow } from "@/features/booking/components/IconRow";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const Notch = ({ side }: { side: "left" | "right" }) => (
  <View
    className="absolute w-5 h-5 rounded-full bg-canvas"
    style={{ top: -10, [side]: -10 }}
  />
);

export default function BookingSuccessScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return (
    <View className="flex-1 bg-canvas">
      {/* Nền cong phía trên */}
      <View
        className="absolute top-0 left-0 right-0 bg-primary-light"
        style={{
          height: 320,
          borderBottomLeftRadius: RADIUS.hero + 16,
          borderBottomRightRadius: RADIUS.hero + 16,
        }}
      />

      <View className="flex-1 px-6 pt-24 items-center">
        {/* Huy hiệu thành công */}
        <View
          className="items-center justify-center mb-7 rounded-full bg-white/60"
          style={{ width: 128, height: 128 }}
        >
          <View
            className="items-center justify-center rounded-full bg-surface"
            style={[{ width: 96, height: 96 }, SHADOWS.float]}
          >
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <Feather name="check" size={34} color={COLORS.white} />
            </View>
          </View>
        </View>

        <Text className="text-[24px] font-extrabold text-center text-ink mb-2">
          Đặt lịch thành công!
        </Text>
        <Text className="text-[14px] leading-5 text-center text-ink-soft mb-7 px-4">
          Đơn của bạn đang chờ nhân viên nhận việc. Bạn có thể theo dõi trạng
          thái ở mục "Đơn của tôi".
        </Text>

        {/* Vé mã đơn */}
        <View
          className="w-full bg-surface border border-line overflow-hidden mb-7"
          style={[{ borderRadius: RADIUS.card }, SHADOWS.card]}
        >
          <View className="px-5 py-4">
            <BookingCodeCard code={code} large />
          </View>

          <View className="relative">
            <Notch side="left" />
            <Notch side="right" />
            <View className="mx-4 border-t border-dashed border-line" />
          </View>

          <View className="px-5 pt-4 pb-5">
            <IconRow
              icon="user-check"
              text="Nhân viên sẽ nhận và xác nhận đơn"
            />
            <IconRow
              icon="bell"
              text="Bạn sẽ nhận thông báo khi có người nhận việc"
              isLast
            />
          </View>
        </View>

        <View className="w-full">
          <TouchableOpacity
            className="bg-primary rounded-2xl h-14 items-center justify-center mb-3"
            style={SHADOWS.float}
            activeOpacity={0.85}
            onPress={() => router.replace("/(tabs)/booking")}
          >
            <Text className="text-white font-bold text-base">Xem đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-2xl h-14 items-center justify-center border border-line bg-surface"
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text className="font-bold text-base text-ink">Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
