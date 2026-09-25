import { useConfirm } from "@/components/common/ConfirmProvider";
import PaymentMethodCard from "@/components/payment/PaymentMethodCard";
import {
  useDeletePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useSetDefaultPaymentMethodMutation,
} from "@/services/paymentMethodApi";
import type { PaymentMethod } from "@/types/PaymentMethod";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#047857";

export default function CustomerPaymentMethodsScreen() {
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
  const isMutating = isSettingDefault || isDeleting;

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await setDefault(method.id).unwrap();
      showSuccessToast("Đã đặt làm tài khoản mặc định");
    } catch (error: any) {
      showErrorToast(
        "Không thể cập nhật",
        error?.data?.message ?? "Vui lòng thử lại sau.",
      );
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    const accepted = await confirm({
      title: "Xóa tài khoản",
      message: `Bạn có chắc muốn xóa ${method.bank_name} ${method.account_number_masked}?`,
      confirmText: "Xóa",
      danger: true,
    });
    if (!accepted) return;

    try {
      await deleteMethod(method.id).unwrap();
      showSuccessToast("Đã xóa tài khoản ngân hàng");
    } catch (error: any) {
      showErrorToast(
        "Không thể xóa",
        error?.data?.message ?? "Vui lòng thử lại sau.",
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={["top", "left", "right"]}
    >
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center mr-3"
        >
          <Feather name="arrow-left" size={21} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-bold">
            Tài khoản ngân hàng
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            Nhận hoàn tiền và rút số dư ví
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={PRIMARY} size="large" />
          <Text className="text-gray-500 mt-3">Đang tải tài khoản...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <Feather name="alert-circle" size={30} color="#DC2626" />
          </View>
          <Text className="text-gray-900 font-bold text-base mt-4">
            Không tải được dữ liệu
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Kiểm tra kết nối và thử lại.
          </Text>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl px-5 py-3 mt-5"
            onPress={() => refetch()}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
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
                  <View className="absolute w-24 h-24 rounded-full bg-white/10 -right-5 -top-8" />
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                      <Feather name="shield" size={19} color="#FFFFFF" />
                    </View>
                    <Text className="text-emerald-50 text-xs leading-5 flex-1">
                      CleanWise chỉ lưu thông tin cần thiết và không bao giờ yêu cầu mật khẩu hoặc OTP ngân hàng.
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-3 ml-1">
                  Tài khoản đã lưu
                </Text>
              </>
            ) : null
          }
          renderItem={({ item }) => (
            <PaymentMethodCard
              method={item}
              disabled={isMutating}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">
                <Feather name="credit-card" size={34} color={PRIMARY} />
              </View>
              <Text className="text-gray-900 font-bold text-lg mt-5">
                Chưa có tài khoản nào
              </Text>
              <Text className="text-gray-500 text-center mt-2 leading-5">
                Thêm tài khoản ngân hàng để nhận hoàn tiền hoặc rút số dư ví CleanWise.
              </Text>
            </View>
          }
        />
      )}

      {!isError && (
        <View
          className="px-5 pt-3 bg-white border-t border-gray-100"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            className="flex-row bg-emerald-700 rounded-2xl py-4 items-center justify-center"
            onPress={() => router.push("/profile/payment-methods/add" as any)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">
              Thêm phương thức
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
