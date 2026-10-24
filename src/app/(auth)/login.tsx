import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import {
  AuthScreen,
  OrDivider,
  PillButton,
  PillInput,
} from "@/features/auth/components/AuthKit";
import { useLogin } from "@/features/auth/hooks/useLogin";
import googleIcon from "@assets/icon/google.png";
import { Link, router } from "expo-router";
import { Image, Text, View } from "react-native";

export default function LoginScreen() {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const {
    phone,
    setPhone,
    password,
    setPassword,
    error,
    isLoading,
    isGoogleLoading,
    googleReady,
    submit,
    submitGoogle,
  } = useLogin();

  return (
    <AuthScreen
      icon="home"
      title={t("Đăng nhập")}
      subtitle={t("Đăng nhập để tiếp tục đặt lịch dọn dẹp cho nhà bạn.")}
      onBack={() => router.replace("/")}
      footer={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.inkSoft }}>
            {t("Chưa có tài khoản?")}{" "}
          </Text>
          <Link href="/(auth)/register">
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: COLORS.primary }}
            >
              {t("Đăng ký")}</Text>
          </Link>
        </View>
      }
    >
      <PillInput
        icon="phone"
        placeholder={t("Số điện thoại")}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <PillInput
        icon="lock"
        placeholder={t("Mật khẩu")}
        password
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ alignItems: "flex-end", marginTop: -4, marginBottom: 12 }}>
        <Link href="/(auth)/forgot-password">
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#F59E0B",
            }}
          >
            {t("Quên mật khẩu?")}</Text>
        </Link>
      </View>

      {error ? (
        <Text
          style={{
            fontSize: 13,
            color: COLORS.danger,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      ) : null}

      <PillButton
        title={isLoading ? t("Đang đăng nhập...") : t("Đăng nhập")}
        onPress={submit}
        loading={isLoading}
      />

      <OrDivider />

      <PillButton
        variant="outline"
        title={t("Đăng nhập với Google")}
        onPress={submitGoogle}
        disabled={!googleReady}
        loading={isGoogleLoading}
        left={
          <Image
            source={googleIcon}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        }
      />
    </AuthScreen>
  );
}
