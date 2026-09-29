import { AuthCard, AuthHeading } from "@/components/auth/AuthCard";
import type { FeatherName } from "@/components/ui";
import { Button, ErrorText, Input, PasswordInput } from "@/components/ui";
import { COLORS } from "@/constants/theme";
import {
  useRegister,
  type RegisterFormKey,
} from "@/features/auth/hooks/useRegister";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type FieldConfig = {
  key: RegisterFormKey;
  label: string;
  icon: FeatherName;
  placeholder: string;
  keyboardType?: "phone-pad" | "email-address" | "default";
  autoCapitalize?: "none" | "words";
};

const FIELDS: FieldConfig[] = [
  {
    key: "username",
    label: "Tên đăng nhập",
    icon: "user",
    placeholder: "vd. minhanh92",
    autoCapitalize: "none",
  },
  {
    key: "first_name",
    label: "Họ",
    icon: "user",
    placeholder: "Nguyễn",
    autoCapitalize: "words",
  },
  {
    key: "last_name",
    label: "Tên",
    icon: "user",
    placeholder: "Minh Anh",
    autoCapitalize: "words",
  },
  {
    key: "email",
    label: "Email",
    icon: "mail",
    placeholder: "ban@email.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    key: "phone_number",
    label: "Số điện thoại",
    icon: "phone",
    placeholder: "090 123 4567",
    keyboardType: "phone-pad",
  },
];

export default function RegisterScreen() {
  const { form, update, agree, toggleAgree, error, isLoading, submit } =
    useRegister();

  return (
    <AuthCard onBack={() => router.back()}>
      <AuthHeading
        title="Tạo tài khoản"
        subtitle="Chỉ mất một phút để bắt đầu đặt lịch dọn dẹp."
      />

      {FIELDS.map((f) => (
        <Input
          key={f.key}
          label={f.label}
          required
          icon={f.icon}
          placeholder={f.placeholder}
          keyboardType={f.keyboardType ?? "default"}
          autoCapitalize={f.autoCapitalize ?? "none"}
          value={form[f.key]}
          onChangeText={(v) => update(f.key, v)}
        />
      ))}

      <PasswordInput
        label="Mật khẩu"
        required
        placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
        value={form.password}
        onChangeText={(v) => update("password", v)}
      />
      <PasswordInput
        label="Xác nhận mật khẩu"
        required
        placeholder="Nhập lại mật khẩu"
        value={form.password_confirm}
        onChangeText={(v) => update("password_confirm", v)}
      />

      <TouchableOpacity
        className="flex-row items-start mb-2"
        onPress={toggleAgree}
        activeOpacity={0.7}
      >
        <View
          className={`w-5 h-5 rounded-sm mr-3 mt-0.5 items-center justify-center border ${
            agree ? "bg-primary border-primary" : "bg-surface border-line"
          }`}
        >
          {agree && <Feather name="check" size={12} color={COLORS.white} />}
        </View>
        <Text className="flex-1 text-sm text-ink-soft">
          Tôi đồng ý với{" "}
          <Text className="font-medium text-primary">Điều khoản</Text> và{" "}
          <Text className="font-medium text-primary">Chính sách bảo mật</Text>
        </Text>
      </TouchableOpacity>

      <ErrorText message={error} />

      <Button
        title={isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        onPress={submit}
        disabled={isLoading}
        className="mt-4"
      />

      <View className="flex-row justify-center mt-7">
        <Text className="text-sm text-ink-soft">Đã có tài khoản? </Text>
        <Link href="/(auth)/login">
          <Text className="text-sm font-semibold text-primary">Đăng nhập</Text>
        </Link>
      </View>
    </AuthCard>
  );
}
