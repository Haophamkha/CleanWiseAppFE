import { MenuListItem } from "@/components/common/MenuListItem";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ROUTES, STORAGE_KEYS } from "@/config/constants";

import { NotificationBellButton } from "@/components/common/NotificationBellButton";
import { clearAuth } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { storage } from "@/utils/storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  const isAuthenticated = !!user;

  const displayName = user
    ? `${user.last_name ?? ""} ${user.first_name ?? ""}`.trim()
    : "Người dùng";

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
          await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);

          dispatch(clearAuth());
          router.replace(ROUTES.HOME);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-gray-50">
        <TouchableOpacity>
          <Feather name="menu" size={24} color="#111827" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-emerald-700">Tài khoản</Text>

        {isAuthenticated ? (
          <NotificationBellButton />
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View className="bg-emerald-50 rounded-3xl items-center py-8 mb-6">
          <View
            className="w-24 h-24 rounded-full bg-white items-center justify-center border-4 border-white overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 96,
                  height: 96,
                }}
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={40} color="#9CA3AF" />
            )}
          </View>

          <Text className="text-xl font-bold text-gray-900 mt-4">
            {isAuthenticated ? displayName : "Khách"}
          </Text>
        </View>

        {/* SECTION 1: Thông tin */}
        <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-3 ml-1">
          Thông tin
        </Text>

        {isAuthenticated ? (
          <>
            <MenuListItem
              icon="user"
              label="Thông tin cá nhân"
              onPress={() => router.push(ROUTES.EDIT_PROFILE as any)}
            />
            <MenuListItem
              icon="map-pin"
              label="Địa chỉ của tôi"
              onPress={() => router.push("/profile/address" as any)}
            />
            <MenuListItem icon="heart" label="Nhân viên yêu thích" />
            <MenuListItem icon="clock" label="Lịch sử thanh toán" />
            <MenuListItem icon="tag" label="Khuyến mãi" />
            <MenuListItem icon="star" label="Đánh giá của tôi" />
          </>
        ) : (
          <RequireLoginNotice message="Đăng nhập để xem thông tin cá nhân, địa chỉ, đơn hàng và ưu đãi của bạn" />
        )}

        {/* SECTION 2: Hỗ trợ */}
        <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-3 ml-1 mt-4">
          Hỗ trợ
        </Text>

        <MenuListItem icon="settings" label="Cài đặt" />
        <MenuListItem icon="info" label="Về CleanWise" />

        {/* Logout - chỉ hiện khi đã đăng nhập */}
        {isAuthenticated && (
          <TouchableOpacity
            className="flex-row items-center justify-center bg-red-50 rounded-2xl py-4 mt-4 mb-10"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={18} color="#DC2626" />
            <Text className="text-red-600 font-bold text-base ml-2">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        )}

        {!isAuthenticated && <View className="h-10" />}
      </ScrollView>
    </View>
  );
}
