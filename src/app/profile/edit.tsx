import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/authApi";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const { data: profile, isLoading, error } = useGetProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // =========================
  // Form state
  // =========================
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [avatarFile, setAvatarFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // =========================
  // Load profile
  // =========================
  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.first_name ?? "");
    setLastName(profile.last_name ?? "");
    setPhone(profile.phone_number ?? "");
    setEmail(profile.email ?? "");

    // Avatar mới chọn thì giữ lại,
    // còn khi load profile mới thì reset.
    setAvatarFile(null);
  }, [profile]);

  // =========================
  // Check changed
  // =========================
  const hasChanges =
    firstName.trim() !== (profile?.first_name ?? "") ||
    lastName.trim() !== (profile?.last_name ?? "") ||
    phone.trim() !== (profile?.phone_number ?? "") ||
    email.trim() !== (profile?.email ?? "") ||
    avatarFile !== null;

  // =========================
  // Back
  // =========================
  const handleBack = () => {
    if (isUpdating) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // =========================
  // Pick avatar
  // =========================
  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập",
        "Vui lòng cho phép ứng dụng truy cập thư viện ảnh.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    console.log("IMAGE ASSET:", asset);

    setAvatarFile({
      uri: asset.uri,
      name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  // =========================
  // Update
  // =========================
  const handleUpdate = async () => {
    if (!hasChanges || isUpdating) return;

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        ...(avatarFile ? { avatar: avatarFile } : {}),
      }).unwrap();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.log("update profile failed", error);

      Alert.alert(
        "Cập nhật thất bại",
        "Không thể cập nhật thông tin. Vui lòng thử lại.",
      );
    }
  };

  // =========================
  // Avatar
  // =========================
  const avatarUri = avatarFile?.uri ?? profile?.avatar ?? null;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={handleBack}
          className="mr-4"
          disabled={isUpdating}
          activeOpacity={0.7}
        >
          <Feather
            name="arrow-left"
            size={22}
            color={isUpdating ? "#D1D5DB" : "#111827"}
          />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-gray-900">
          Chỉnh sửa thông tin
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-28 h-28 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{
                    width: 112,
                    height: 112,
                  }}
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
              disabled={isUpdating}
            >
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Họ và tên đệm */}
        <Text className="text-gray-700 font-medium mb-1">Họ</Text>

        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Feather name="user" size={18} color="#9CA3AF" />

          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Nhập họ"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            editable={!isUpdating}
          />
        </View>

        {/* Tên */}
        <Text className="text-gray-700 font-medium mb-1">Tên</Text>

        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Feather name="user" size={18} color="#9CA3AF" />

          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Nhập tên"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isUpdating}
          />
        </View>

        {/* Phone */}
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
            editable={!isUpdating}
          />
        </View>

        {/* Email */}
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
            editable={!isUpdating}
          />
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${
            hasChanges && !isUpdating ? "bg-emerald-700" : "bg-gray-300"
          }`}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={!hasChanges || isUpdating}
        >
          <Text
            className={`font-bold text-base ${
              hasChanges && !isUpdating ? "text-white" : "text-gray-500"
            }`}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
