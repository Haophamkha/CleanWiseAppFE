import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { COLORS } from "@/constants/theme";
import type { WalletTransaction } from "@/features/wallet/api/walletApi";
import { WalletHero } from "@/features/wallet/components/WalletHero";
import { WithdrawModal } from "@/features/wallet/components/WithdrawModal";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WITHDRAW_ENABLED = false; // bật true khi BE làm xong rút tiền

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function TransactionRow({
  tx,
  last,
}: {
  tx: WalletTransaction;
  last: boolean;
}) {
  const isCredit = tx.direction === "CREDIT";
  const failed = tx.status === "FAILED";
  const color = failed
    ? COLORS.inkMuted
    : isCredit
      ? COLORS.success
      : COLORS.danger;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.line,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isCredit ? COLORS.successLight : COLORS.dangerLight,
        }}
      >
        <Feather
          name={isCredit ? "arrow-down-left" : "arrow-up-right"}
          size={17}
          color={isCredit ? COLORS.success : COLORS.danger}
        />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}
        >
          {tx.type_display}
        </Text>
        {!!(tx.note || tx.booking_code) && (
          <Text
            numberOfLines={2}
            style={{ marginTop: 2, fontSize: 12, color: COLORS.inkSoft }}
          >
            {tx.note || tx.booking_code}
          </Text>
        )}
        <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.inkMuted }}>
          {fmtDateTime(tx.created_at)}
          {tx.status !== "SUCCESS" ? ` · ${tx.status_display}` : ""}
        </Text>
      </View>

      <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: "800", color }}>
        {isCredit ? "+" : "-"}
        {formatVnd(Number(tx.amount))}
      </Text>
    </View>
  );
}

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
          onWithdraw={WITHDRAW_ENABLED ? w.openWithdraw : undefined}
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
            Số dư trong ví được cộng khi đơn hàng hoặc buổi làm được hoàn tiền,
            và có thể dùng để thanh toán đơn mới.
          </Text>
        </View>

        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <Text
            style={{
              marginBottom: 10,
              marginLeft: 4,
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 1,
              color: COLORS.inkMuted,
            }}
          >
            LỊCH SỬ GIAO DỊCH
          </Text>

          {w.txLoading ? (
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : w.transactions.length === 0 ? (
            <View
              style={{
                paddingVertical: 32,
                alignItems: "center",
                borderRadius: 20,
                backgroundColor: COLORS.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: COLORS.line,
              }}
            >
              <Text style={{ fontSize: 13, color: COLORS.inkMuted }}>
                Chưa có giao dịch nào
              </Text>
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: COLORS.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: COLORS.line,
              }}
            >
              {w.transactions.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  last={i === w.transactions.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {WITHDRAW_ENABLED && (
        <WithdrawModal
          visible={w.withdrawVisible}
          balance={w.balance}
          onClose={w.closeWithdraw}
        />
      )}

      <LoadingOverlay
        visible={w.isInitialLoading}
        fullscreen
        text="Đang tải ví của bạn..."
      />
    </View>
  );
}
