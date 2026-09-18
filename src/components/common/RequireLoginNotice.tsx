import { ROUTES } from "@/config/constants";
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
    <View
      className="rounded-3xl mb-3 overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#ECFDF5",
        shadowColor: "#047857",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 24,
        elevation: 4,
      }}
    >
      {/* Dải nền trang trí phía trên, có hoạ tiết chấm bo tròn góc dưới thành sóng nhẹ */}
      <View
        style={{
          backgroundColor: "#ECFDF5",
          paddingTop: 28,
          paddingBottom: 40,
          alignItems: "center",
        }}
      >
        {/* Chấm trang trí */}
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 24,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#A7F3D0",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 34,
            right: 32,
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: "#A7F3D0",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 14,
            right: 60,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#6EE7B7",
          }}
        />

        <View
          className="items-center justify-center"
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            backgroundColor: "#FFFFFF",
            shadowColor: "#047857",
            shadowOpacity: 0.18,
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: "#047857" }}
          >
            <Feather name="user" size={24} color="#fff" />
          </View>
        </View>
      </View>

      {/* Nội dung */}
      <View
        className="items-center px-6"
        style={{ marginTop: -22, paddingBottom: 24 }}
      >
        <View
          className="items-center px-5 py-4 rounded-2xl mb-1"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            elevation: 2,
            width: "100%",
          }}
        >
          <Text className="text-gray-900 font-extrabold text-[17px] mb-1 text-center">
            Bạn chưa đăng nhập
          </Text>
          <Text className="text-gray-500 text-[13px] text-center leading-5">
            {message}
          </Text>
        </View>

        {/* 2 nút nằm ngang */}
        <View className="flex-row w-full mt-5" style={{ gap: 10 }}>
          <TouchableOpacity
            className="flex-1 rounded-2xl py-3.5 items-center justify-center"
            style={{
              backgroundColor: "#ECFDF5",
              borderWidth: 1.5,
              borderColor: "#A7F3D0",
            }}
            onPress={() => router.push(ROUTES.REGISTER as any)}
            activeOpacity={0.8}
          >
            <Text
              className="font-bold text-[14px]"
              style={{ color: "#047857" }}
            >
              Đăng ký
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-2xl py-3.5 items-center justify-center flex-row"
            style={{
              backgroundColor: "#047857",
              shadowColor: "#047857",
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 3,
            }}
            onPress={() => router.push(ROUTES.LOGIN as any)}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-[14px] mr-1.5">
              Đăng nhập
            </Text>
            <Feather name="arrow-right" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
