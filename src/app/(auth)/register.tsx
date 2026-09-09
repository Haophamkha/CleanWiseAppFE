import { ROUTES } from "@/config/constants";
import { useRegisterMutation } from "@/services/authApi";
import { setUser } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { registerSchema } from "@/utils/validators";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password_confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    if (!agree) {
      setError("Bạn cần đồng ý điều khoản để tiếp tục");
      return;
    }
    setError("");
    try {
      const res = await register({ ...form, role: "CUSTOMER" }).unwrap();
      dispatch(setUser(res.user));
      showSuccessToast(
        "Tạo tài khoản thành công",
        `Chào mừng ${res.user.first_name || ""} đến với CleanWise`,
      );
      router.replace(ROUTES.HOME);
    } catch (e: any) {
      const errors = e?.data?.errors;
      let message = "Tạo tài khoản thất bại, vui lòng thử lại";
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
      showErrorToast("Không thể tạo tài khoản", message);
    }
  };

  const fields: {
    key: keyof typeof form;
    label: string;
    icon: React.ComponentProps<typeof Feather>["name"];
    placeholder: string;
    keyboardType?: "phone-pad" | "email-address" | "default";
  }[] = [
    {
      key: "username",
      label: "Tên đăng nhập",
      icon: "user",
      placeholder: "vd. minhanh92",
    },
    { key: "first_name", label: "Họ", icon: "user", placeholder: "Nguyễn" },
    { key: "last_name", label: "Tên", icon: "user", placeholder: "Minh Anh" },
    {
      key: "email",
      label: "Email",
      icon: "mail",
      placeholder: "ban@email.com",
      keyboardType: "email-address",
    },
    {
      key: "phone_number",
      label: "Số điện thoại",
      icon: "phone",
      placeholder: "090 123 4567",
      keyboardType: "phone-pad",
    },
  ];

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
              Tạo tài khoản
            </Text>
            <Text className="text-[#6B7268] text-[15px] leading-5 mb-8">
              Chỉ mất một phút để bắt đầu đặt lịch dọn dẹp.
            </Text>

            {/* Dynamic fields */}
            {fields.map((f) => (
              <View key={f.key}>
                <Text className="text-[#1B2420] text-sm mb-2">{f.label}</Text>
                <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-4">
                  <Feather name={f.icon} size={17} color="#9A9A8E" />
                  <TextInput
                    className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                    placeholder={f.placeholder}
                    placeholderTextColor="#9A9A8E"
                    autoCapitalize="none"
                    keyboardType={f.keyboardType ?? "default"}
                    value={form[f.key]}
                    onChangeText={(v) => update(f.key, v)}
                  />
                </View>
              </View>
            ))}

            {/* Password */}
            <Text className="text-[#1B2420] text-sm mb-2">Mật khẩu</Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-4">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor="#9A9A8E"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(v) => update("password", v)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={17}
                  color="#9A9A8E"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm password */}
            <Text className="text-[#1B2420] text-sm mb-2">
              Xác nhận mật khẩu
            </Text>
            <View className="flex-row items-center bg-[#F7F5EF] border border-[#E7E3D8] rounded-2xl px-4 py-3.5 mb-5">
              <Feather name="lock" size={17} color="#9A9A8E" />
              <TextInput
                className="flex-1 ml-3 text-[#1B2420] text-[15px]"
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#9A9A8E"
                secureTextEntry={!showPassword}
                value={form.password_confirm}
                onChangeText={(v) => update("password_confirm", v)}
              />
            </View>

            {/* Agree checkbox */}
            <TouchableOpacity
              className="flex-row items-start mb-2"
              onPress={() => setAgree(!agree)}
            >
              <View
                className={`w-5 h-5 rounded-md mr-3 mt-0.5 items-center justify-center border ${
                  agree
                    ? "bg-[#1F4D3D] border-[#1F4D3D]"
                    : "bg-white border-[#D8D4C8]"
                }`}
              >
                {agree && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text className="text-[#6B7268] text-[14px] leading-5 flex-1">
                Tôi đồng ý với{" "}
                <Text className="text-[#1F4D3D] font-medium">Điều khoản</Text>{" "}
                và{" "}
                <Text className="text-[#1F4D3D] font-medium">
                  Chính sách bảo mật
                </Text>
              </Text>
            </TouchableOpacity>

            {!!error && (
              <Text className="text-[#B3413B] text-sm mt-2 mb-1">{error}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              className="bg-[#1F4D3D] rounded-2xl py-4 items-center mt-5"
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-[15px]">
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center mt-7">
              <Text className="text-[#6B7268] text-[15px]">
                Đã có tài khoản?{" "}
              </Text>
              <Link href="/(auth)/login">
                <Text className="text-[#1F4D3D] font-semibold text-[15px]">
                  Đăng nhập
                </Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
