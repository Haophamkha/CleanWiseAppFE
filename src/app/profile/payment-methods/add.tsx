import BankPickerModal from "@/components/payment/BankPickerModal";
import {
  useCreateBankPaymentMethodMutation,
  useGetBankCatalogQuery,
  useGetPaymentMethodOptionsQuery,
} from "@/services/paymentMethodApi";
import type {
  BankCatalogItem,
  PaymentMethodOption,
} from "@/types/PaymentMethod";
import { showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
  return error?.data?.message || "Không thể lưu tài khoản. Vui lòng thử lại.";
};

export default function AddCustomerPaymentMethodScreen() {
  const [step, setStep] = useState<Step>("options");
  const [selectedBank, setSelectedBank] = useState<BankCatalogItem | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState("");
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

  const visibleOptions = useMemo<PaymentMethodOption[]>(
    () =>
      options.length
        ? options
        : [
            { code: "MOMO", name: "Ví MoMo", status: "COMING_SOON" },
            { code: "VNPAY", name: "VNPAY", status: "COMING_SOON" },
            {
              code: "BANK_ACCOUNT",
              name: "Tài khoản ngân hàng",
              status: "AVAILABLE",
            },
          ],
    [options],
  );

  const handleBack = () => {
    if (isSaving) return;
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
      "Sắp hỗ trợ",
      `CleanWise đang hoàn thiện tính năng liên kết ${option.name}.`,
    );
  };

  const handleSubmit = async () => {
    const normalizedAccount = accountNumber.replace(/\s/g, "");
    if (!selectedBank) return setError("Vui lòng chọn ngân hàng.");
    if (!/^\d{6,19}$/.test(normalizedAccount)) {
      return setError("Số tài khoản phải gồm từ 6 đến 19 chữ số.");
    }
    if (accountHolderName.trim().length < 2) {
      return setError("Vui lòng nhập tên chủ tài khoản.");
    }

    setError("");
    try {
      await createBankMethod({
        bank_bin: selectedBank.bin,
        bank_code: selectedBank.code,
        bank_name: selectedBank.short_name || selectedBank.name,
        account_number: normalizedAccount,
        account_holder_name: accountHolderName
          .trim()
          .toLocaleUpperCase("vi"),
        display_name: displayName.trim() || undefined,
        is_default: isDefault,
      }).unwrap();
      showSuccessToast("Đã thêm tài khoản ngân hàng");
      router.back();
    } catch (requestError) {
      setError(getFirstError(requestError));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={handleBack}
            className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center mr-3"
            disabled={isSaving}
          >
            <Feather name="arrow-left" size={21} color="#111827" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-bold flex-1">
            {step === "options"
              ? "Thêm phương thức"
              : "Thêm tài khoản ngân hàng"}
          </Text>
        </View>

        {step === "options" ? (
          <ScrollView
            className="flex-1 bg-gray-50 px-5 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-emerald-700 rounded-3xl p-5 mb-6 overflow-hidden">
              <View className="absolute w-28 h-28 rounded-full bg-white/10 -right-7 -top-10" />
              <Feather name="credit-card" size={24} color="#FFFFFF" />
              <Text className="text-white font-extrabold text-lg mt-3">
                Chọn phương thức nhận tiền
              </Text>
              <Text className="text-emerald-100 text-sm leading-5 mt-1">
                Dùng khi nhận hoàn tiền hoặc rút số dư từ ví CleanWise.
              </Text>
            </View>

            {isLoadingOptions ? (
              <ActivityIndicator color={PRIMARY} className="mt-10" />
            ) : (
              visibleOptions.map((option) => {
                const available = option.status === "AVAILABLE";
                return (
                  <TouchableOpacity
                    key={option.code}
                    className="flex-row items-center bg-white rounded-3xl border border-gray-100 p-4 mb-3"
                    onPress={() => handleOption(option)}
                    activeOpacity={0.75}
                  >
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${available ? "bg-emerald-50" : "bg-gray-100"}`}
                    >
                      <Feather
                        name={optionIcon(option.code)}
                        size={22}
                        color={available ? PRIMARY : "#9CA3AF"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold text-base">
                        {option.name}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${available ? "text-emerald-700" : "text-gray-400"}`}
                      >
                        {available ? "Có thể thêm ngay" : "Sắp hỗ trợ"}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#D1D5DB" />
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
                  Tài khoản được lưu ở trạng thái chưa xác minh. CleanWise không yêu cầu mật khẩu hoặc OTP ngân hàng.
                </Text>
              </View>

              <Text className="text-gray-700 font-medium mb-1">Ngân hàng</Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3.5 mb-4"
                onPress={() => setPickerVisible(true)}
                disabled={isLoadingBanks || isBankError}
              >
                <Feather name="briefcase" size={18} color="#9CA3AF" />
                <Text
                  className={`flex-1 ml-3 ${selectedBank ? "text-gray-900" : "text-gray-400"}`}
                >
                  {isLoadingBanks
                    ? "Đang tải ngân hàng..."
                    : selectedBank?.short_name || "Chọn ngân hàng"}
                </Text>
                <Feather name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              {isBankError && (
                <TouchableOpacity onPress={() => refetchBanks()} className="mb-4">
                  <Text className="text-red-600 text-sm">
                    Không tải được ngân hàng. Nhấn để thử lại.
                  </Text>
                </TouchableOpacity>
              )}

              <Text className="text-gray-700 font-medium mb-1">Số tài khoản</Text>
              <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 mb-4">
                <Feather name="hash" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 py-3.5 text-gray-900"
                  placeholder="Nhập số tài khoản"
                  placeholderTextColor="#9CA3AF"
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
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-700 font-medium mb-1">
                Tên chủ tài khoản
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 mb-4">
                <Feather name="user" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 py-3.5 text-gray-900"
                  placeholder="NGUYEN VAN A"
                  placeholderTextColor="#9CA3AF"
                  value={accountHolderName}
                  onChangeText={(value) => {
                    setAccountHolderName(value);
                    setError("");
                  }}
                  autoCapitalize="characters"
                />
              </View>

              <Text className="text-gray-700 font-medium mb-1">
                Tên gợi nhớ (không bắt buộc)
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 mb-5">
                <Feather name="tag" size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 py-3.5 text-gray-900"
                  placeholder="Ví dụ: Tài khoản cá nhân"
                  placeholderTextColor="#9CA3AF"
                  value={displayName}
                  onChangeText={setDisplayName}
                  maxLength={100}
                />
              </View>

              <View className="flex-row items-center justify-between py-3 border-t border-gray-100">
                <View className="flex-1 pr-4">
                  <Text className="text-gray-900 font-semibold">
                    Đặt làm mặc định
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    Ưu tiên tài khoản này khi nhận tiền.
                  </Text>
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

            <View className="px-5 pt-3 pb-7 border-t border-gray-100 bg-white">
              <TouchableOpacity
                className="rounded-2xl py-4 items-center bg-emerald-700"
                style={{ opacity: isSaving ? 0.6 : 1 }}
                onPress={handleSubmit}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Lưu tài khoản
                  </Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
