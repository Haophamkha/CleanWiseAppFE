import { useTranslation } from "react-i18next";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import {
    useCreateBankPaymentMethodMutation,
    useGetBankCatalogQuery,
    useGetPaymentMethodOptionsQuery,
    useStartBankAccountVerificationMutation,
    useConfirmBankAccountVerificationMutation,
} from "@/features/payment/api/paymentMethodApi";
import BankPickerModal from "@/features/payment/components/BankPickerModal";
import type {
    BankCatalogItem,
    PaymentMethodOption,
} from "@/features/payment/types/PaymentMethod";
import { showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "options" | "bank-form";

const PRIMARY = "#047857";

const optionIcon = (
  code: PaymentMethodOption["code"],
): keyof typeof Feather.glyphMap => {
  if (code === "MOMO") return "smartphone";
  if (code === "VNPAY") return "shopping-bag";
  return "credit-card";
};

const getFirstError = (error: any) => {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors).flat().find(Boolean);
    if (typeof first === "string") return first;
  }
  return error?.data?.message || t("Không thể lưu tài khoản. Vui lòng thử lại.");
};

export default function AddCustomerPaymentMethodScreen() {
  const { t } = useTranslation();

  const { COLORS, mode: themeMode } = useAppTheme();

  const [step, setStep] = useState<Step>("options");
  const [selectedBank, setSelectedBank] = useState<BankCatalogItem | null>(
    null,
  );
  const [accountNumber, setAccountNumber] = useState("");
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [identity, setIdentity] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMethodId, setOtpMethodId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState("");

  const { data: options = [], isLoading: isLoadingOptions } =
    useGetPaymentMethodOptionsQuery();
  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    isError: isBankError,
    refetch: refetchBanks,
  } = useGetBankCatalogQuery(undefined, { skip: step !== "bank-form" });
  const [createBankMethod, { isLoading: isSaving }] =
    useCreateBankPaymentMethodMutation();
  const [startVerification, { isLoading: isStartingVerification }] =
    useStartBankAccountVerificationMutation();
  const [confirmVerification, { isLoading: isConfirming }] =
    useConfirmBankAccountVerificationMutation();
  const isBusy = isSaving || isStartingVerification || isConfirming;

  const visibleOptions = useMemo<PaymentMethodOption[]>(
    () =>
      options.length
        ? options
        : [
            { code: "MOMO", name: t("Ví MoMo"), status: "COMING_SOON" },
            { code: "VNPAY", name: "VNPAY", status: "COMING_SOON" },
            {
              code: "BANK_ACCOUNT",
              name: t("Tài khoản ngân hàng"),
              status: "AVAILABLE",
            },
          ],
    [options, t],
  );

  const handleBack = () => {
    if (isBusy) return;
    if (step === "bank-form") {
      setStep("options");
      setError("");
    } else {
      router.back();
    }
  };

  const handleOption = (option: PaymentMethodOption) => {
    if (option.code === "BANK_ACCOUNT" && option.status === "AVAILABLE") {
      setStep("bank-form");
      return;
    }
    Alert.alert(
      t("Sắp hỗ trợ"),
      t("CleanWise đang hoàn thiện tính năng liên kết {{value0}}.", { value0: option.name }),
    );
  };

  const handleSubmit = async () => {
    const normalizedAccount = accountNumber.replace(/\s/g, "");
    if (!selectedBank) return setError(t("Vui lòng chọn ngân hàng."));
    if (!/^\d{6,19}$/.test(normalizedAccount)) {
      return setError(t("Số tài khoản phải gồm từ 6 đến 19 chữ số."));
    }
    if (accountHolderName.trim().length < 2) {
      return setError(t("Vui lòng nhập tên chủ tài khoản."));
    }
    if (!/^\d{9,14}$/.test(identity)) {
      return setError(t("CCCD/CMND Sandbox phải gồm từ 9 đến 14 chữ số."));
    }
    if (!/^0\d{9}$/.test(mobile)) {
      return setError(t("Số điện thoại Sandbox phải gồm 10 chữ số và bắt đầu bằng 0."));
    }

    setError("");
    try {
      const method = await createBankMethod({
        bank_bin: selectedBank.bin,
        bank_code: selectedBank.code,
        bank_name: selectedBank.short_name || selectedBank.name,
        account_number: normalizedAccount,
        account_holder_name: accountHolderName.trim().toLocaleUpperCase("vi"),
        display_name: displayName.trim() || undefined,
        is_default: isDefault,
      }).unwrap();
      showSuccessToast(t("Đã thêm tài khoản ngân hàng"));
      try {
        const result = await startVerification({ id: method.id, identity, mobile }).unwrap();
        if (result.requires_otp) {
          setOtpMethodId(method.id);
          return;
        }
      } catch (verificationError: any) {
        Alert.alert(
          t("Tài khoản đã được lưu"),
          verificationError?.data?.message ??
            t("Không thể bắt đầu xác minh. Bạn có thể thử lại trong danh sách tài khoản."),
          [{ text: t("Để sau"), onPress: () => router.back() }],
        );
        return;
      }
      router.back();
    } catch (requestError) {
      setError(getFirstError(requestError));
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpMethodId) return;
    try {
      await confirmVerification({ id: otpMethodId, otp }).unwrap();
      showSuccessToast(t("Xác minh Sandbox TINGEE thành công"));
      setOtpMethodId(null);
      router.back();
    } catch (verificationError: any) {
      Alert.alert(t("OTP chưa hợp lệ"), verificationError?.data?.message ?? t("Vui lòng thử lại."));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-row items-center px-5 py-4 border-b border-line">
          <TouchableOpacity
            onPress={handleBack}
            className="w-9 h-9 rounded-full bg-canvas items-center justify-center mr-3"
            disabled={isBusy}
          >
            <Feather name="arrow-left" size={21} color="#111827" />
          </TouchableOpacity>
          <Text className="text-ink text-lg font-bold flex-1">
            {step === "options"
              ? t("Thêm phương thức")
              : t("Thêm tài khoản ngân hàng")}
          </Text>
        </View>

        {step === "options" ? (
          <ScrollView
            className="flex-1 bg-canvas px-5 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-emerald-700 rounded-3xl p-5 mb-6 overflow-hidden">
              <View className="absolute w-28 h-28 rounded-full bg-surface/10 -right-7 -top-10" />
              <Feather name="credit-card" size={24} color="#FFFFFF" />
              <Text className="text-white font-extrabold text-lg mt-3">
                {t("Chọn phương thức nhận tiền")}</Text>
              <Text className="text-emerald-100 text-sm leading-5 mt-1">
                {t("Dùng khi nhận hoàn tiền hoặc rút số dư từ ví CleanWise.")}</Text>
            </View>

            {isLoadingOptions ? (
              <ActivityIndicator color={PRIMARY} className="mt-10" />
            ) : (
              visibleOptions.map((option) => {
                const available = option.status === "AVAILABLE";
                return (
                  <TouchableOpacity
                    key={option.code}
                    className="flex-row items-center bg-surface rounded-3xl border border-line p-4 mb-3"
                    onPress={() => handleOption(option)}
                    activeOpacity={0.75}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${available ? "bg-emerald-50" : "bg-canvas"}`}
                    >
                      <Feather
                        name={optionIcon(option.code)}
                        size={22}
                        color={available ? PRIMARY : "#9CA3AF"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-ink font-bold text-base">
                        {option.name}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${available ? "text-emerald-700" : "text-ink-muted"}`}
                      >
                        {available ? t("Có thể thêm ngay") : t("Sắp hỗ trợ")}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.line} />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        ) : (
          <>
            <ScrollView
              className="flex-1 px-5 pt-6"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 28 }}
            >
              <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex-row">
                <Feather name="shield" size={19} color={PRIMARY} />
                <Text className="flex-1 text-emerald-800 text-sm leading-5 ml-3">
                  {t("Dùng dữ liệu giả lập TINGEE Sandbox và nhập OTP test. Không nhập mật khẩu hoặc OTP ngân hàng thật.")}</Text>
              </View>

              <Text className="text-ink font-medium mb-1">{t("Ngân hàng")}</Text>
              <TouchableOpacity
                className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 py-3.5 mb-4"
                onPress={() => setPickerVisible(true)}
                disabled={isLoadingBanks || isBankError}
              >
                <Feather name="briefcase" size={18} color={COLORS.inkMuted} />
                <Text
                  className={`flex-1 ml-3 ${selectedBank ? "text-ink" : "text-ink-muted"}`}
                >
                  {isLoadingBanks
                    ? t("Đang tải ngân hàng...")
                    : selectedBank?.short_name || t("Chọn ngân hàng")}
                </Text>
                <Feather name="chevron-down" size={18} color={COLORS.inkMuted} />
              </TouchableOpacity>
              {isBankError && (
                <TouchableOpacity
                  onPress={() => refetchBanks()}
                  className="mb-4"
                >
                  <Text className="text-red-600 text-sm">
                    {t("Không tải được ngân hàng. Nhấn để thử lại.")}</Text>
                </TouchableOpacity>
              )}

              <Text className="text-ink font-medium mb-1">
                {t("Số tài khoản")}</Text>
              <View className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 mb-4">
                <Feather name="hash" size={18} color={COLORS.inkMuted} />
                <TextInput keyboardAppearance={themeMode}
                  className="flex-1 ml-3 py-3.5 text-ink"
                  placeholder={t("Nhập số tài khoản")}
                  placeholderTextColor={COLORS.inkMuted}
                  keyboardType="number-pad"
                  value={accountNumber}
                  onChangeText={(value) => {
                    setAccountNumber(value.replace(/\D/g, ""));
                    setError("");
                  }}
                  maxLength={19}
                  secureTextEntry={!showAccountNumber}
                />
                <TouchableOpacity
                  onPress={() => setShowAccountNumber((value) => !value)}
                  className="p-1 ml-2"
                >
                  <Feather
                    name={showAccountNumber ? "eye-off" : "eye"}
                    size={18}
                    color={COLORS.inkMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-ink font-medium mb-1">
                {t("Tên chủ tài khoản")}</Text>
              <View className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 mb-4">
                <Feather name="user" size={18} color={COLORS.inkMuted} />
                <TextInput keyboardAppearance={themeMode}
                  className="flex-1 ml-3 py-3.5 text-ink"
                  placeholder="NGUYEN VAN A"
                  placeholderTextColor={COLORS.inkMuted}
                  value={accountHolderName}
                  onChangeText={(value) => {
                    setAccountHolderName(value);
                    setError("");
                  }}
                  autoCapitalize="characters"
                />
              </View>

              <Text className="text-ink font-medium mb-1">CCCD/CMND Sandbox</Text>
              <View className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 mb-4">
                <Feather name="user-check" size={18} color={COLORS.inkMuted} />
                <TextInput keyboardAppearance={themeMode} className="flex-1 ml-3 py-3.5 text-ink" placeholder={t("Mã định danh trong kịch bản test")} value={identity} onChangeText={setIdentity} keyboardType="number-pad" maxLength={14} />
              </View>

              <Text className="text-ink font-medium mb-1">{t("Số điện thoại Sandbox")}</Text>
              <View className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 mb-4">
                <Feather name="smartphone" size={18} color={COLORS.inkMuted} />
                <TextInput keyboardAppearance={themeMode} className="flex-1 ml-3 py-3.5 text-ink" placeholder={t("Số điện thoại trong kịch bản test")} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} />
              </View>

              <Text className="text-ink font-medium mb-1">
                {t("Tên gợi nhớ (không bắt buộc)")}</Text>
              <View className="flex-row items-center border border-line bg-canvas rounded-2xl px-4 mb-5">
                <Feather name="tag" size={18} color={COLORS.inkMuted} />
                <TextInput keyboardAppearance={themeMode}
                  className="flex-1 ml-3 py-3.5 text-ink"
                  placeholder={t("Ví dụ: Tài khoản cá nhân")}
                  placeholderTextColor={COLORS.inkMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  maxLength={100}
                />
              </View>

              <View className="flex-row items-center justify-between py-3 border-t border-line">
                <View className="flex-1 pr-4">
                  <Text className="text-ink font-semibold">
                    {t("Đặt làm mặc định")}</Text>
                  <Text className="text-ink-soft text-sm mt-1">
                    {t("Ưu tiên tài khoản này khi nhận tiền.")}</Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
                  thumbColor={isDefault ? PRIMARY : "#F9FAFB"}
                />
              </View>

              {!!error && (
                <View className="flex-row bg-red-50 rounded-xl p-3 mt-4">
                  <Feather name="alert-circle" size={17} color="#DC2626" />
                  <Text className="flex-1 text-red-600 text-sm ml-2">
                    {error}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View className="px-5 pt-3 pb-7 border-t border-line bg-surface">
              <TouchableOpacity
                className="rounded-2xl py-4 items-center bg-emerald-700"
                style={{ opacity: isBusy ? 0.6 : 1 }}
                onPress={handleSubmit}
                disabled={isBusy}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {t("Lưu và xác minh")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <BankPickerModal
          visible={pickerVisible}
          banks={banks}
          onClose={() => setPickerVisible(false)}
          onSelect={(bank) => {
            setSelectedBank(bank);
            setPickerVisible(false);
            setError("");
          }}
        />
        <Modal visible={otpMethodId !== null} transparent animationType="fade" onRequestClose={() => setOtpMethodId(null)}>
          <View className="flex-1 bg-black/40 justify-center px-6">
            <View className="bg-surface rounded-3xl p-5">
              <Text className="text-ink text-lg font-bold">{t("Nhập OTP Sandbox")}</Text>
              <Text className="text-ink-soft mt-2 leading-5">{t("Nhập mã OTP giả lập của kịch bản TINGEE.")}</Text>
              <TextInput keyboardAppearance={themeMode} className="border border-line rounded-2xl px-4 py-3 mt-4 text-ink" keyboardType="number-pad" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 8))} placeholder={t("Mã OTP")} maxLength={8} />
              <View className="flex-row mt-5">
                <TouchableOpacity className="flex-1 py-3 items-center" onPress={() => setOtpMethodId(null)}><Text className="text-ink-soft font-semibold">{t("Để sau")}</Text></TouchableOpacity>
                <TouchableOpacity className="flex-1 py-3 items-center bg-emerald-700 rounded-xl" onPress={handleConfirmOtp} disabled={isConfirming || otp.length < 4}><Text className="text-white font-bold">{isConfirming ? t("Đang kiểm tra...") : t("Xác nhận")}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
