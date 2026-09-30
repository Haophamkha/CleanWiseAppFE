import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { COLORS } from "@/constants/theme";
import { WalletHero } from "@/features/wallet/components/WalletHero";
import { WithdrawModal } from "@/features/wallet/components/WithdrawModal";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { Feather } from "@expo/vector-icons";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Wallet() {
  const w = useWallet();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={w.refreshing}
            onRefresh={w.onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <WalletHero
          balance={w.balance}
          isInitialLoading={w.isInitialLoading}
          isBackgroundFetching={w.isBackgroundFetching}
          onWithdraw={w.openWithdraw}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginHorizontal: 16,
            marginTop: 16,
            padding: 14,
            borderRadius: 16,
            backgroundColor: COLORS.primarySoft,
          }}
        >
          <Feather
            name="info"
            size={16}
            color={COLORS.primaryDark}
            style={{ marginTop: 2, marginRight: 10 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              lineHeight: 19,
              color: COLORS.primaryDark,
            }}
          >
            Số dư trong ví được cộng khi đơn hàng của bạn được hoàn tiền. Bạn có
            thể rút về tài khoản ngân hàng bất cứ lúc nào.
          </Text>
        </View>
      </ScrollView>

      <WithdrawModal
        visible={w.withdrawVisible}
        balance={w.balance}
        onClose={w.closeWithdraw}
      />

      <LoadingOverlay
        visible={w.isInitialLoading}
        fullscreen
        text="Đang tải ví của bạn..."
      />
    </View>
  );
}
