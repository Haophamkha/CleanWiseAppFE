import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useConfirm } from "@/components/common/ConfirmProvider";
import {
    useConfirmBankAccountVerificationMutation,
    useStartBankAccountVerificationMutation,
    useDeletePaymentMethodMutation,
    useGetPaymentMethodsQuery,
    useSetDefaultPaymentMethodMutation,
} from "@/features/payment/api/paymentMethodApi";
import PaymentMethodCard from "@/features/payment/components/PaymentMethodCard";
import type { PaymentMethod } from "@/features/payment/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    AppState,
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const PRIMARY = "#047857";

export default function CustomerPaymentMethodsScreen() {
  const { t } = useTranslation();

  const { mode: themeMode } = useAppTheme();

  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const {
    data: methods = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPaymentMethodsQuery();
  const [setDefault, { isLoading: isSettingDefault }] =
    useSetDefaultPaymentMethodMutation();
  const [deleteMethod, { isLoading: isDeleting }] =
    useDeletePaymentMethodMutation();
  const [startVerification, { isLoading: isVerifying }] =
    useStartBankAccountVerificationMutation();
  const [confirmVerification, { isLoading: isConfirming }] =
    useConfirmBankAccountVerificationMutation();
  const [otpMethodId, setOtpMethodId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [verifyMethodId, setVerifyMethodId] = useState<number | null>(null);
  const [identity, setIdentity] = useState("");
  const [mobile, setMobile] = useState("");
  const isMutating = isSettingDefault || isDeleting || isVerifying || isConfirming;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  const handleVerify = async (method: PaymentMethod) => {
    setIdentity("");
    setMobile("");
    setVerifyMethodId(method.id);
  };

  const handleStartVerification = async () => {
    if (!verifyMethodId) return;
    try {
      const result = await startVerification({ id: verifyMethodId, identity, mobile }).unwrap();
      const methodId = verifyMethodId;
      setVerifyMethodId(null);
      if (result.requires_otp) setOtpMethodId(methodId);
      else showSuccessToast(t("Tài khoản đã được xác minh trên Sandbox TINGEE"));
      await refetch();
    } catch (error: any) {
      showErrorToast(
        t("Không thể mở xác minh"),
        error?.data?.message ?? t("Vui lòng thử lại sau."),
      );
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpMethodId) return;
    try {
      await confirmVerification({ id: otpMethodId, otp }).unwrap();
      setOtpMethodId(null);
      setOtp("");
      showSuccessToast(t("Xác minh Sandbox thành công"));
      await refetch();
    } catch (error: any) {
      showErrorToast(t("OTP chưa hợp lệ"), error?.data?.message ?? t("Vui lòng thử lại."));
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await setDefault(method.id).unwrap();
      showSuccessToast(t("Đã đặt làm tài khoản mặc định"));
    } catch (error: any) {
      showErrorToast(
        t("Không thể cập nhật"),
        error?.data?.message ?? t("Vui lòng thử lại sau."),
      );
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    const accepted = await confirm({
      title: t("Xóa tài khoản"),
      message: t("Bạn có chắc muốn xóa {{value0}} {{value1}}?", { value0: method.bank_name, value1: method.account_number_masked }),
      confirmText: t("Xóa"),
      danger: true,
    });
    if (!accepted) return;

    try {
      await deleteMethod(method.id).unwrap();
      showSuccessToast(t("Đã xóa tài khoản ngân hàng"));
    } catch (error: any) {
      showErrorToast(
        t("Không thể xóa"),
        error?.data?.message ?? t("Vui lòng thử lại sau."),
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-canvas"
      edges={["top", "left", "right"]}
    >
      <View className="flex-row items-center px-5 py-4 bg-surface border-b border-line">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-canvas items-center justify-center mr-3"
        >
          <Feather name="arrow-left" size={21} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-ink text-lg font-bold">
            {t("Tài khoản ngân hàng")}</Text>
          <Text className="text-ink-soft text-xs mt-0.5">
            {t("Nhận hoàn tiền và rút số dư ví")}</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={PRIMARY} size="large" />
          <Text className="text-ink-soft mt-3">{t("Đang tải tài khoản...")}</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Feather name="alert-circle" size={30} color="#DC2626" />
          </View>
          <Text className="text-ink font-bold text-base mt-4">
            {t("Không tải được dữ liệu")}</Text>
          <Text className="text-ink-soft text-center mt-2">
            {t("Kiểm tra kết nối và thử lại.")}</Text>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl px-5 py-3 mt-5"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">{t("Thử lại")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={methods}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 22,
            paddingBottom: 24,
            flexGrow: methods.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          ListHeaderComponent={
            methods.length ? (
              <>
                <View className="bg-emerald-700 rounded-3xl px-5 py-4 mb-5 overflow-hidden">
                  <View className="absolute w-24 h-24 rounded-full bg-surface/10 -right-5 -top-8" />
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-surface/20 items-center justify-center mr-3">
                      <Feather name="shield" size={19} color="#FFFFFF" />
                    </View>
                    <Text className="text-emerald-50 text-xs leading-5 flex-1">
                      {t("CleanWise không nhận mật khẩu hoặc OTP ngân hàng. Nếu xác minh, bạn sẽ nhập mã OTP mô phỏng của TINGEE Sandbox.")}</Text>
                  </View>
                </View>
                <Text className="text-ink-soft font-semibold text-xs uppercase tracking-wide mb-3 ml-1">
                  {t("Tài khoản đã lưu")}</Text>
              </>
            ) : null
          }
          renderItem={({ item }) => (
            <PaymentMethodCard
              method={item}
              disabled={isMutating}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
              onVerify={handleVerify}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">
                <Feather name="credit-card" size={34} color={PRIMARY} />
              </View>
              <Text className="text-ink font-bold text-lg mt-5">
                {t("Chưa có tài khoản nào")}</Text>
              <Text className="text-ink-soft text-center mt-2 leading-5">
                {t("Thêm tài khoản ngân hàng để nhận hoàn tiền hoặc rút số dư ví CleanWise.")}</Text>
            </View>
          }
        />
      )}

      {!isError && (
        <View
          className="px-5 pt-3 bg-surface border-t border-line"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            className="flex-row bg-emerald-700 rounded-2xl py-4 items-center justify-center"
            onPress={() => router.push("/profile/payment-methods/add" as any)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              {t("Thêm phương thức")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={otpMethodId !== null || verifyMethodId !== null} transparent animationType="fade" onRequestClose={() => { setOtpMethodId(null); setVerifyMethodId(null); }}>
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-surface rounded-3xl p-5">
            {verifyMethodId !== null ? <>
              <Text className="text-ink text-lg font-bold">{t("Thông tin Sandbox")}</Text>
              <Text className="text-ink-soft mt-2 leading-5">{t("Nhập CCCD/CMND và điện thoại theo kịch bản test TINGEE.")}</Text>
              <TextInput keyboardAppearance={themeMode} className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={identity} onChangeText={(value) => setIdentity(value.replace(/\D/g, "").slice(0, 14))} placeholder="CCCD/CMND test" />
              <TextInput keyboardAppearance={themeMode} className="border border-line rounded-2xl px-4 py-3 mt-3 text-ink" keyboardType="phone-pad" value={mobile} onChangeText={(value) => setMobile(value.replace(/\D/g, "").slice(0, 10))} placeholder={t("Điện thoại test")} />
            </> : <>
              <Text className="text-ink text-lg font-bold">{t("Nhập OTP Sandbox")}</Text>
              <Text className="text-ink-soft mt-2 leading-5">{t("Nhập mã OTP giả lập hiển thị trong luồng test TINGEE.")}</Text>
              <TextInput keyboardAppearance={themeMode} className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 8))} placeholder={t("Mã OTP")} maxLength={8} />
            </>}
            <View className="flex-row mt-5">
              <TouchableOpacity className="flex-1 py-3 items-center" onPress={() => { setOtpMethodId(null); setVerifyMethodId(null); }}>
                <Text className="text-ink-soft font-semibold">{t("Để sau")}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 items-center bg-emerald-700 rounded-xl" onPress={verifyMethodId !== null ? handleStartVerification : handleConfirmOtp} disabled={isConfirming || isVerifying || (verifyMethodId !== null ? identity.length < 9 || mobile.length !== 10 || !mobile.startsWith("0") : otp.length < 4)}>
                <Text className="text-white font-bold">{isConfirming || isVerifying ? t("Đang kiểm tra...") : verifyMethodId !== null ? t("Bắt đầu xác minh") : t("Xác nhận OTP")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
