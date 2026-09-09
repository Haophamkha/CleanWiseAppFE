import { ROUTES } from "@/config/constants";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import {
  useLoginMutation,
  useLoginWithGoogleMutation,
} from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { loginSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";

import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [loginWithGoogle, { isLoading: isGoogleLoading }] =
    useLoginWithGoogleMutation();
  const dispatch = useAppDispatch();

  const handleGoogleSuccess = async (idToken: string) => {
    setError("");
    try {
      const res = await loginWithGoogle({ id_token: idToken }).unwrap();
      dispatch(setUser(res.user));
      showSuccessToast(
        "Đăng nhập thành công",
        `Chào mừng trở lại, ${res.user.first_name || ""}`,
      );
      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const message =
        e?.data?.message || "Đăng nhập Google thất bại, vui lòng thử lại";
      setError(message);
      showErrorToast("Đăng nhập Google thất bại", message);
    }
  };

  const { request, promptAsync } = useGoogleAuth(handleGoogleSuccess);

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ phone, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError("");

    try {
      const res = await login({ phone, password }).unwrap();
      dispatch(setUser(res.user));
      showSuccessToast(
        "Đăng nhập thành công",
        `Chào mừng trở lại, ${res.user.first_name || ""}`,
      );
      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const errors = e?.data?.errors;
      let message = "Đăng nhập thất bại, vui lòng thử lại";
      if (errors && typeof errors === "object") {
        const firstField = Object.keys(errors)[0];
        const firstMessage = Array.isArray(errors[firstField])
          ? errors[firstField][0]
          : errors[firstField];
        message = firstMessage || message;
      } else {
        message = e?.data?.message || message;
      }
      setError(message);
      showErrorToast("Đăng nhập thất bại", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        className="flex-1 bg-[#FAF9F5]"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[420px] self-center">
          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="w-10 h-10 rounded-full bg-white border border-[#E7E3D8] items-center justify-center mb-4"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color="#1B2420" />
          </TouchableOpacity>

          <View className="bg-white rounded-[28px] border border-[#E7E3D8] p-8 sm:p-10">
            {/* Wordmark */}
            <View className="flex-row items-center mb-8">
              <View className="w-9 h-9 rounded-full bg-[#E7EFE9] items-center justify-center mr-3">
                <Feather name="droplet" size={16} color="#1F4D3D" />
              </View>
              <Text className="text-[#1B2420] text-base font-semibold tracking-tight">
                CleanWise
              </Text>
            </View>

            {/* Headline */}
            <Text className="text-[#1B2420] text-[26px] leading-8 font-semibold mb-2">
              Chào bạn quay lại
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Đăng nhập để tiếp tục đặt lịch dọn dẹp cho nhà bạn.
            </Text>

            {/* Phone */}
            <Text className="text-[#1B2420] text-sm mb-2">Số điện thoại</Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-4">
              <Feather name="phone" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#9A9A8E"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#1B2420] text-sm">Mật khẩu</Text>
              <Link href="/(auth)/forgot-password">
                <Text className="text-[#1F4D3D] text-sm font-medium">
                  Quên mật khẩu?
                </Text>
              </Link>
            </View>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-2">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Nhập mật khẩu của bạn"
                placeholderTextColor="#9A9A8E"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={17}
                  color="#9A9A8E"
                />
              </TouchableOpacity>
            </View>

            {!!error && (
              <Text className="text-[#B3413B] text-sm mt-2 mb-1">{error}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 flex-row justify-center items-center mt-5"
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-[15px] mr-2">
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
              {!isLoading && (
                <Feather name="arrow-right" size={17} color="#fff" />
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-7">
              <View className="flex-1 h-px bg-[#E7E3D8]" />
              <Text className="text-[#9A9A8E] mx-3 text-sm">
                Hoặc tiếp tục với
              </Text>
              <View className="flex-1 h-px bg-[#E7E3D8]" />
            </View>

            {/* Google */}
            <TouchableOpacity
              className="flex-row justify-center items-center border border-[#E7E3D8] rounded-2xl py-3.5"
              disabled={!request || isGoogleLoading}
              onPress={() => promptAsync()}
            >
              <Image
                source={require("../../../assets/icon/google.png")}
                style={{ width: 18, height: 18, marginRight: 10 }}
              />
              <Text className="font-medium text-[#1B2420] text-[15px]">
                {isGoogleLoading ? "Đang đăng nhập..." : "Google"}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-[#6B7268] text-[15px]">
                Chưa có tài khoản?{" "}
              </Text>
              <Link href="/(auth)/register">
                <Text className="text-[#1F4D3D] font-semibold text-[15px]">
                  Đăng ký
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
