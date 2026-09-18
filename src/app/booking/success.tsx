import { COLORS } from "@/components/service/formFieldShared";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function BookingSuccessScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Nền cong màu nhạt phía trên */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          backgroundColor: COLORS.primaryLight,
          borderBottomLeftRadius: 48,
          borderBottomRightRadius: 48,
        }}
      />

      <View className="flex-1 px-6 pt-24 items-center">
        {/* Badge tròn có 2 vòng viền nhẹ kiểu ripple */}
        <View
          className="items-center justify-center mb-7"
          style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            backgroundColor: "rgba(255,255,255,0.55)",
          }}
        >
          <View
            className="items-center justify-center"
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: COLORS.white,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.18,
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 20,
              elevation: 6,
            }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Feather name="check" size={32} color="#fff" />
            </View>
          </View>
        </View>

        <Text
          className="text-[22px] font-extrabold text-center mb-2"
          style={{ color: COLORS.text }}
        >
          Đặt lịch thành công!
        </Text>
        <Text
          className="text-[14px] text-center mb-7 px-4"
          style={{ color: COLORS.textMuted }}
        >
          Đơn của bạn đang chờ nhân viên nhận việc. Bạn có thể theo dõi trạng
          thái ở mục "Đơn của tôi".
        </Text>

        {/* Card mã đơn kiểu vé, viền đứt + nút copy */}
        <View
          style={{
            width: "100%",
            borderRadius: 20,
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
            elevation: 3,
            marginBottom: 28,
            overflow: "hidden",
          }}
        >
          <View className="px-5 pt-4 pb-3">
            <Text
              className="text-[12px] font-bold uppercase"
              style={{ color: COLORS.textMuted, letterSpacing: 0.4 }}
            >
              Mã đơn hàng
            </Text>
          </View>

          <View className="flex-row items-center justify-between px-5 pb-4">
            <Text
              className="text-[22px] font-extrabold"
              style={{ color: COLORS.primary, letterSpacing: 1 }}
            >
              {code}
            </Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              activeOpacity={0.8}
              className="flex-row items-center px-3 py-2 rounded-xl"
              style={{
                backgroundColor: copied ? COLORS.primary : COLORS.primaryLight,
              }}
            >
              <Feather
                name={copied ? "check" : "copy"}
                size={14}
                color={copied ? "#fff" : COLORS.primary}
              />
              <Text
                className="text-[12px] font-bold ml-1.5"
                style={{ color: copied ? "#fff" : COLORS.primary }}
              >
                {copied ? "Đã chép" : "Sao chép"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Đường viền đứt kiểu vé xé */}
          <View style={{ position: "relative" }}>
            <View
              style={{
                position: "absolute",
                left: -10,
                top: -10,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: COLORS.background,
              }}
            />
            <View
              style={{
                position: "absolute",
                right: -10,
                top: -10,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: COLORS.background,
              }}
            />
            <View
              style={{
                borderTopWidth: 1,
                borderStyle: "dashed",
                borderColor: COLORS.border,
                marginHorizontal: 16,
              }}
            />
          </View>

          {/* Các bước tiếp theo */}
          <View className="px-5 pt-4 pb-5">
            <NextStepRow
              icon="user-check"
              text="Nhân viên sẽ nhận và xác nhận đơn"
            />
            <NextStepRow
              icon="bell"
              text="Bạn sẽ nhận thông báo khi có người nhận việc"
              isLast
            />
          </View>
        </View>

        <View style={{ width: "100%" }}>
          <TouchableOpacity
            className="rounded-2xl py-4 items-center w-full mb-3"
            style={{
              backgroundColor: COLORS.primary,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.25,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 14,
              elevation: 4,
            }}
            activeOpacity={0.85}
            onPress={() => router.replace("/(tabs)/booking")}
          >
            <Text className="text-white font-bold text-base">Xem đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-2xl py-4 items-center w-full"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text
              className="font-bold text-base"
              style={{ color: COLORS.text }}
            >
              Về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function NextStepRow({
  icon,
  text,
  isLast,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center"
      style={{ marginBottom: isLast ? 0 : 10 }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: COLORS.primaryLight }}
      >
        <Feather name={icon} size={14} color={COLORS.primary} />
      </View>
      <Text
        className="text-[13px] flex-1"
        style={{ color: COLORS.textSecondary }}
      >
        {text}
      </Text>
    </View>
  );
}
