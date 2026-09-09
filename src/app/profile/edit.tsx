import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/authApi";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const { data: profile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(
      `${profile.last_name ?? ""} ${profile.first_name ?? ""}`.trim(),
    );
    setPhone(profile.phone_number ?? "");
    setEmail(profile.email ?? "");
  }, [profile]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setAvatarFile({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "avatar.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  const handleUpdate = async () => {
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const first_name = nameParts.pop() ?? "";
    const last_name = nameParts.join(" ");

    try {
      await updateProfile({
        first_name,
        last_name,
        email,
        phone_number: phone,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      }).unwrap();
      router.back();
    } catch (error) {
      // TODO: hiển thị toast lỗi
      console.log("update profile failed", error);
    }
  };

  const avatarUri = avatarFile?.uri ?? profile?.avatar ?? null;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Chỉnh sửa thông tin
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 112, height: 112 }}
                  resizeMode="cover"
                />
              ) : (
                <Feather name="user" size={48} color="#9CA3AF" />
              )}
            </View>

            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-emerald-700 w-9 h-9 rounded-full items-center justify-center border-2 border-white"
              activeOpacity={0.8}
              onPress={handlePickAvatar}
            >
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fields */}
        <Text className="text-gray-700 font-medium mb-1">Họ tên</Text>
        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Feather name="user" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Nhập họ tên"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <Text className="text-gray-700 font-medium mb-1">Số điện thoại</Text>
        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Feather name="phone" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <Text className="text-gray-700 font-medium mb-1">Email</Text>
        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Feather name="mail" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Nhập email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-emerald-700 rounded-xl py-4 items-center"
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={isUpdating}
        >
          <Text className="text-white font-bold text-base">
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
