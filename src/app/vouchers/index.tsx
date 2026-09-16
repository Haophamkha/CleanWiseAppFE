import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { VoucherDetailModal } from "@/components/voucher/VoucherDetailModal";
import {
  useClaimVoucherByCodeMutation,
  useGetMyVouchersQuery,
  useGetPublicVouchersQuery,
} from "@/services/voucherApi";
import { useAppSelector } from "@/store/hooks";
import type { UserVoucher, Voucher } from "@/types/Voucher";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type VoucherTab = "discover" | "mine";
type SelectedVoucher = {
  voucher: Voucher;
  walletVoucher?: UserVoucher;
};

const getApiErrorMessage = (error: any) => {
  const errors = error?.data?.errors;
  const fieldError = errors?.code ?? errors?.voucher ?? errors?.non_field_errors;
  if (Array.isArray(fieldError)) return fieldError[0];
  if (typeof fieldError === "string") return fieldError;
  return error?.data?.message ?? "Không thể nhận voucher. Vui lòng thử lại.";
};

export default function VouchersScreen() {
  const isAuthenticated = !!useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<VoucherTab>("discover");
  const [voucherCode, setVoucherCode] = useState("");
  const [claimingCode, setClaimingCode] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<SelectedVoucher | null>(null);

  const publicQuery = useGetPublicVouchersQuery(undefined, { skip: !isAuthenticated });
  const walletQuery = useGetMyVouchersQuery(undefined, { skip: !isAuthenticated });
  const [claimVoucher, claimState] = useClaimVoucherByCodeMutation();

  const data = useMemo(
    () => (activeTab === "discover" ? publicQuery.data ?? [] : walletQuery.data ?? []),
    [activeTab, publicQuery.data, walletQuery.data],
  );
  const currentQuery = activeTab === "discover" ? publicQuery : walletQuery;

  const handleClaim = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      showErrorToast("Thiếu mã voucher", "Vui lòng nhập mã bạn muốn nhận.");
      return false;
    }

    Keyboard.dismiss();
    setClaimingCode(code);
    try {
      await claimVoucher(code).unwrap();
      setVoucherCode("");
      showSuccessToast("Đã nhận voucher", `${code} đã được thêm vào ví của bạn.`);
      return true;
    } catch (error) {
      showErrorToast("Không thể nhận voucher", getApiErrorMessage(error));
      return false;
    } finally {
      setClaimingCode(null);
    }
  };

  const renderHeader = () => (
    <>
      {activeTab === "discover" && (
        <View className="bg-emerald-700 rounded-3xl p-5 mb-5 overflow-hidden">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
              <Feather name="gift" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Bạn có mã ưu đãi?</Text>
              <Text className="text-emerald-100 text-xs mt-0.5">Nhập mã để thêm voucher vào ví</Text>
            </View>
          </View>

          <View className="flex-row bg-white rounded-2xl p-1.5">
            <TextInput
              className="flex-1 px-3 text-gray-900 font-semibold"
              placeholder="Nhập mã voucher"
              placeholderTextColor="#9CA3AF"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => handleClaim(voucherCode)}
              editable={!claimState.isLoading}
            />
            <TouchableOpacity
              className="bg-emerald-600 rounded-xl px-4 py-3 min-w-20 items-center"
              onPress={() => handleClaim(voucherCode)}
              disabled={claimState.isLoading}
              activeOpacity={0.8}
            >
              {claimState.isLoading && claimingCode === voucherCode.trim().toUpperCase() ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-sm font-bold">Nhận mã</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text className="text-gray-900 text-base font-bold">
          {activeTab === "discover" ? "Ưu đãi dành cho bạn" : "Voucher đã nhận"}
        </Text>
        <Text className="text-gray-400 text-xs">{data.length} voucher</Text>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center">
        <Feather name={activeTab === "discover" ? "tag" : "inbox"} size={28} color="#047857" />
      </View>
      <Text className="text-gray-900 font-bold text-base mt-4">
        {activeTab === "discover" ? "Chưa có ưu đãi mới" : "Ví voucher đang trống"}
      </Text>
      <Text className="text-gray-400 text-sm text-center mt-2 leading-5">
        {activeTab === "discover"
          ? "Các voucher mới sẽ xuất hiện tại đây khi chương trình bắt đầu."
          : "Hãy khám phá ưu đãi hoặc nhập mã voucher để thêm vào ví."}
      </Text>
      {activeTab === "mine" && (
        <TouchableOpacity
          className="bg-emerald-700 rounded-xl px-5 py-3 mt-5"
          onPress={() => setActiveTab("discover")}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm">Khám phá voucher</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 justify-center">
          <Feather name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">Kho voucher</Text>
          <Text className="text-[11px] text-gray-400 mt-0.5">Ưu đãi dành riêng cho bạn</Text>
        </View>
        <View className="w-9" />
      </View>

      <View className="mx-5 mb-4 bg-gray-200/70 rounded-2xl p-1 flex-row">
        {([
          ["discover", "Khám phá", "compass"],
          ["mine", "Voucher của tôi", "tag"],
        ] as const).map(([value, label, icon]) => {
          const selected = activeTab === value;
          return (
            <TouchableOpacity
              key={value}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${selected ? "bg-white" : ""}`}
              style={selected ? { elevation: 1, shadowOpacity: 0.04, shadowRadius: 4 } : undefined}
              onPress={() => setActiveTab(value)}
              activeOpacity={0.8}
            >
              <Feather name={icon} size={15} color={selected ? "#047857" : "#6B7280"} />
              <Text className={`ml-2 text-sm font-bold ${selected ? "text-emerald-700" : "text-gray-500"}`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isAuthenticated ? (
        <View className="px-5 pt-4">
          <RequireLoginNotice message="Đăng nhập để nhận ưu đãi và quản lý voucher của bạn" />
        </View>
      ) : currentQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="text-gray-400 text-sm mt-3">Đang tải voucher...</Text>
        </View>
      ) : currentQuery.isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="wifi-off" size={38} color="#9CA3AF" />
          <Text className="text-gray-900 font-bold mt-4">Không tải được voucher</Text>
          <Text className="text-gray-400 text-sm text-center mt-2">Kiểm tra kết nối và thử lại nhé.</Text>
          <TouchableOpacity
            className="bg-emerald-700 rounded-xl px-6 py-3 mt-5"
            onPress={() => currentQuery.refetch()}
          >
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<Voucher | UserVoucher>
          key={activeTab}
          data={data}
          keyExtractor={(item) => `${activeTab}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={currentQuery.isFetching}
              onRefresh={() => currentQuery.refetch()}
              tintColor="#047857"
              colors={["#047857"]}
            />
          }
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => {
            const walletItem = activeTab === "mine" ? (item as UserVoucher) : undefined;
            const voucher = walletItem?.voucher ?? (item as Voucher);
            return (
              <VoucherCard
                voucher={voucher}
                walletVoucher={walletItem}
                onClaim={handleClaim}
                onPress={() => setSelectedVoucher({ voucher, walletVoucher: walletItem })}
                isClaiming={claimState.isLoading && claimingCode === voucher.code}
              />
            );
          }}
        />
      )}

      <VoucherDetailModal
        visible={!!selectedVoucher}
        voucher={selectedVoucher?.voucher ?? null}
        walletVoucher={selectedVoucher?.walletVoucher}
        isClaiming={
          claimState.isLoading && claimingCode === selectedVoucher?.voucher.code
        }
        onClose={() => setSelectedVoucher(null)}
        onClaim={handleClaim}
      />
    </View>
  );
}
