import { useTranslation } from "react-i18next";
import { translate as t } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RequireLoginNotice } from "@/components/common/RequireLoginNotice";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import ScreenContainer from "@/components/ScreenContainer";
import { SHADOWS } from "@/constants/theme";
import { VoucherCard } from "@/features/voucher/components/VoucherCard";
import { VoucherClaimBox } from "@/features/voucher/components/VoucherClaimBox";
import { VoucherDetailModal } from "@/features/voucher/components/VoucherDetailModal";
import {
  useVouchers,
  type VoucherTab,
} from "@/features/voucher/hooks/useVouchers";
import type { UserVoucher, Voucher } from "@/features/voucher/types/Voucher";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getLocalizedTabs(): { value: VoucherTab; label: string; icon: "compass" | "tag" }[] {
  return [
    { value: "discover", label: t("Khám phá"), icon: "compass" },
    { value: "mine", label: t("Voucher của tôi"), icon: "tag" },
  ];
}

export function Vouchers() {
  const { t } = useTranslation();

  const { COLORS } = useAppTheme();

  const v = useVouchers();

  const header = (
    <>
      {v.activeTab === "discover" && (
        <VoucherClaimBox
          code={v.voucherCode}
          onChange={v.setVoucherCode}
          onSubmit={() => v.claim(v.voucherCode)}
          loading={v.isClaiming(v.voucherCode.trim().toUpperCase())}
          disabled={v.isClaimingAny}
        />
      )}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text className="text-base font-bold text-ink">
          {v.activeTab === "discover"
            ? t("Ưu đãi dành cho bạn")
            : t("Voucher đã nhận")}
        </Text>
        <View className="bg-primary-light rounded-full px-2.5 py-1">
          <Text className="text-xs font-bold text-primary-dark">
            {v.data.length} voucher
          </Text>
        </View>
      </View>
    </>
  );

  const empty = (
    <View className="items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center">
        <Feather
          name={v.activeTab === "discover" ? "tag" : "inbox"}
          size={28}
          color={COLORS.primaryDark}
        />
      </View>
      <Text className="text-base font-bold text-ink mt-4">
        {v.activeTab === "discover"
          ? t("Chưa có ưu đãi mới")
          : t("Ví voucher đang trống")}
      </Text>
      <Text className="text-sm text-ink-muted text-center mt-2 leading-5">
        {v.activeTab === "discover"
          ? t("Các voucher mới sẽ xuất hiện tại đây khi chương trình bắt đầu.")
          : t("Hãy khám phá ưu đãi hoặc nhập mã voucher để thêm vào ví.")}
      </Text>
      {v.activeTab === "mine" && (
        <TouchableOpacity
          className="bg-primary-fill rounded-xl px-5 py-3 mt-5"
          onPress={() => v.setActiveTab("discover")}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm">{t("Khám phá voucher")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Kho voucher" />

      {/* Tab */}
      <View className="mx-4 mt-4 mb-4 bg-line rounded-lg p-1 flex-row">
        {getLocalizedTabs().map((tab) => {
          const selected = v.activeTab === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              className={`flex-1 flex-row items-center justify-center rounded-md py-2.5 ${
                selected ? "bg-surface" : ""
              }`}
              style={selected ? SHADOWS.card : undefined}
              onPress={() => v.setActiveTab(tab.value)}
              activeOpacity={0.8}
            >
              <Feather
                name={tab.icon}
                size={15}
                color={selected ? COLORS.primaryDark : COLORS.inkSoft}
              />
              <Text
                className={`ml-2 text-sm font-bold ${
                  selected ? "text-primary-dark" : "text-ink-soft"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!v.isAuthenticated ? (
        <View className="px-5 pt-2">
          <RequireLoginNotice message={t("Đăng nhập để nhận ưu đãi và quản lý voucher của bạn")} />
        </View>
      ) : v.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-sm text-ink-muted mt-3">
            {t("Đang tải voucher...")}</Text>
        </View>
      ) : v.isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-danger-light items-center justify-center">
            <Feather name="wifi-off" size={28} color={COLORS.danger} />
          </View>
          <Text className="font-bold text-ink mt-4">
            {t("Không tải được voucher")}</Text>
          <Text className="text-sm text-ink-muted text-center mt-2">
            {t("Kiểm tra kết nối và thử lại nhé.")}</Text>
          <TouchableOpacity
            className="bg-primary-fill rounded-xl px-6 py-3 mt-5"
            onPress={v.refetch}
          >
            <Text className="text-white font-bold">{t("Thử lại")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<Voucher | UserVoucher>
          key={v.activeTab}
          data={v.data}
          keyExtractor={(item) => `${v.activeTab}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={v.isFetching}
              onRefresh={v.refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primaryFill]}
            />
          }
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          renderItem={({ item }) => {
            const walletItem =
              v.activeTab === "mine" ? (item as UserVoucher) : undefined;
            const voucher = walletItem?.voucher ?? (item as Voucher);
            return (
              <VoucherCard
                voucher={voucher}
                walletVoucher={walletItem}
                onClaim={v.claim}
                onPress={() => v.openDetail(voucher, walletItem)}
                isClaiming={v.isClaiming(voucher.code)}
              />
            );
          }}
        />
      )}

      <VoucherDetailModal
        visible={!!v.selectedVoucher}
        voucher={v.selectedVoucher?.voucher ?? null}
        walletVoucher={v.selectedVoucher?.walletVoucher}
        isClaiming={v.isClaiming(v.selectedVoucher?.voucher.code)}
        onClose={v.closeDetail}
        onClaim={v.claim}
      />
    </ScreenContainer>
  );
}
