import { COLORS } from "@/constants/theme";
import {
  AuthScreen,
  PillButton,
  PillInput,
} from "@/features/auth/components/AuthKit";
import {
  useRegister,
  type RegisterFormKey,
} from "@/features/auth/hooks/useRegister";
import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type FeatherIcon = React.ComponentProps<typeof Feather>["name"];

type FieldConfig = {
  key: RegisterFormKey;
  icon: FeatherIcon;
  placeholder: string;
  keyboardType?: "phone-pad" | "email-address" | "default";
  autoCapitalize?: "none" | "words";
};

const CONTACT_FIELDS: FieldConfig[] = [
  {
    key: "username",
    icon: "at-sign",
    placeholder: "Tên đăng nhập",
    autoCapitalize: "none",
  },
  {
    key: "email",
    icon: "mail",
    placeholder: "Email",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  {
    key: "phone_number",
    icon: "phone",
    placeholder: "Số điện thoại",
    keyboardType: "phone-pad",
  },
];

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  const rules = [
    { label: "Tối thiểu 8 ký tự", ok: password.length >= 8 },
    { label: "Không toàn là chữ số", ok: !/^\d+$/.test(password) },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: -4,
        marginBottom: 14,
        paddingHorizontal: 6,
      }}
    >
      {rules.map((r) => (
        <View
          key={r.label}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 14,
            marginBottom: 4,
          }}
        >
          <Feather
            name={r.ok ? "check-circle" : "circle"}
            size={13}
            color={r.ok ? COLORS.success : COLORS.inkMuted}
          />
          <Text
            style={{
              marginLeft: 5,
              fontSize: 12,
              color: r.ok ? COLORS.ink : COLORS.inkMuted,
            }}
          >
            {r.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function RegisterScreen() {
  const { form, update, agree, toggleAgree, error, isLoading, submit } =
    useRegister();

  const mismatch =
    form.password_confirm.length > 0 && form.password !== form.password_confirm;

  return (
    <AuthScreen
      icon="user-plus"
      title="Tạo tài khoản"
      subtitle="Chỉ mất một phút để bắt đầu đặt lịch dọn dẹp."
      onBack={() => router.back()}
      footer={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: COLORS.inkSoft }}>
            Đã có tài khoản?{" "}
          </Text>
          <Link href="/(auth)/login">
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: COLORS.primary }}
            >
              Đăng nhập
            </Text>
          </Link>
        </View>
      }
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <PillInput
            icon="user"
            placeholder="Họ và tên đệm"
            autoCapitalize="words"
            value={form.last_name}
            onChangeText={(v) => update("last_name", v)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <PillInput
            placeholder="Tên"
            autoCapitalize="words"
            value={form.first_name}
            onChangeText={(v) => update("first_name", v)}
          />
        </View>
      </View>

      {CONTACT_FIELDS.map((f) => (
        <PillInput
          key={f.key}
          icon={f.icon}
          placeholder={f.placeholder}
          keyboardType={f.keyboardType ?? "default"}
          autoCapitalize={f.autoCapitalize ?? "none"}
          value={form[f.key]}
          onChangeText={(v) => update(f.key, v)}
        />
      ))}

      <PillInput
        icon="lock"
        placeholder="Mật khẩu"
        password
        autoCapitalize="none"
        value={form.password}
        onChangeText={(v) => update("password", v)}
      />
      <PasswordRules password={form.password} />

      <PillInput
        icon="lock"
        placeholder="Xác nhận mật khẩu"
        password
        autoCapitalize="none"
        invalid={mismatch}
        value={form.password_confirm}
        onChangeText={(v) => update("password_confirm", v)}
      />
      {mismatch && (
        <Text
          style={{
            marginTop: -6,
            marginBottom: 10,
            paddingHorizontal: 6,
            fontSize: 12,
            color: COLORS.danger,
          }}
        >
          Mật khẩu xác nhận chưa khớp
        </Text>
      )}

      <TouchableOpacity
        onPress={toggleAgree}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            marginRight: 10,
            marginTop: 1,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: agree ? COLORS.primary : COLORS.line,
            backgroundColor: agree ? COLORS.primary : COLORS.surface,
          }}
        >
          {agree && <Feather name="check" size={12} color={COLORS.white} />}
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            lineHeight: 20,
            color: COLORS.inkSoft,
          }}
        >
          Tôi đồng ý với{" "}
          <Text style={{ fontWeight: "600", color: COLORS.primary }}>
            Điều khoản
          </Text>{" "}
          và{" "}
          <Text style={{ fontWeight: "600", color: COLORS.primary }}>
            Chính sách bảo mật
          </Text>
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text
          style={{
            fontSize: 13,
            color: COLORS.danger,
            marginVertical: 8,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      ) : null}

      <View style={{ marginTop: 12 }}>
        <PillButton
          title={isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          onPress={submit}
          loading={isLoading}
        />
      </View>
    </AuthScreen>
  );
}
