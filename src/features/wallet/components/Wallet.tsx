import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { COLORS, SHADOWS, TREND } from "@/constants/theme";
import type { WalletTransaction } from "@/features/wallet/api/walletApi";
import { TopupModal } from "@/features/wallet/components/TopupModal";
import { WalletHero } from "@/features/wallet/components/WalletHero";
import { WithdrawModal } from "@/features/wallet/components/WithdrawModal";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Filter = "ALL" | "CREDIT" | "DEBIT";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "CREDIT", label: "Tiền vào" },
  { key: "DEBIT", label: "Tiền ra" },
];

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function groupByDay(list: WalletTransaction[]) {
  const groups: { label: string; items: WalletTransaction[] }[] = [];
  for (const tx of list) {
    const label = dayLabel(tx.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(tx);
    else groups.push({ label, items: [tx] });
  }
  return groups;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        marginRight: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: active ? COLORS.primary : COLORS.surface,
        borderWidth: 1,
        borderColor: active ? COLORS.primary : COLORS.line,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: active ? COLORS.white : COLORS.inkSoft,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.direction === "CREDIT";
  const failed = tx.status === "FAILED";
  const tone = isCredit ? TREND.up : TREND.down;
  const toneBg = isCredit ? TREND.upBg : TREND.downBg;
  const amountColor = failed ? COLORS.inkMuted : tone;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          padding: 14,
          marginBottom: 10,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: failed ? COLORS.canvas : toneBg,
        }}
      >
        <Feather
          name={isCredit ? "arrow-down-left" : "arrow-up-right"}
          size={19}
          color={failed ? COLORS.inkMuted : tone}
        />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14.5, fontWeight: "700", color: COLORS.ink }}
        >
          {tx.type_display}
        </Text>
        {!!(tx.note || tx.booking_code) && (
          <Text
            numberOfLines={1}
            style={{ marginTop: 2, fontSize: 12, color: COLORS.inkSoft }}
          >
            {tx.note || tx.booking_code}
          </Text>
        )}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <Text style={{ fontSize: 12, color: COLORS.inkMuted }}>
            {fmtTime(tx.created_at)}
          </Text>
          {tx.status !== "SUCCESS" && (
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: failed
                  ? COLORS.dangerLight
                  : COLORS.primaryLight,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: failed ? COLORS.danger : COLORS.primaryDark,
                }}
              >
                {tx.status_display}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ marginLeft: 8, alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: amountColor,
            textDecorationLine: failed ? "line-through" : "none",
          }}
        >
          {isCredit ? "+" : "-"}
          {formatVnd(Number(tx.amount))}
        </Text>
        {!failed && (
          <Feather
            name={isCredit ? "trending-up" : "trending-down"}
            size={14}
            color={tone}
            style={{ marginTop: 4 }}
          />
        )}
      </View>
    </View>
  );
}

export function Wallet() {
  const w = useWallet();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("ALL");

  const list =
    filter === "ALL"
      ? w.transactions
      : w.transactions.filter((t) =>
          filter === "CREDIT"
            ? t.direction === "CREDIT"
            : t.direction !== "CREDIT",
        );
  const groups = groupByDay(list);

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
          transactions={w.transactions}
          onWithdraw={w.openWithdraw}
          onTopup={w.openTopup}
        />

        <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
          <Text
            style={{
              marginLeft: 4,
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.ink,
            }}
          >
            Lịch sử giao dịch
          </Text>

          <View style={{ flexDirection: "row", marginTop: 14 }}>
            {FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                active={filter === f.key}
                onPress={() => setFilter(f.key)}
              />
            ))}
          </View>

          {w.txLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : groups.length === 0 ? (
            <View
              style={{
                marginTop: 16,
                paddingVertical: 36,
                alignItems: "center",
                borderRadius: 24,
                backgroundColor: COLORS.surface,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: COLORS.line,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.primaryLight,
                }}
              >
                <Feather
                  name="file-text"
                  size={24}
                  color={COLORS.primaryDark}
                />
              </View>
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: "700",
                  color: COLORS.ink,
                }}
              >
                Chưa có giao dịch nào
              </Text>
              <Text
                style={{ marginTop: 4, fontSize: 13, color: COLORS.inkMuted }}
              >
                Nạp tiền để thanh toán đơn nhanh hơn.
              </Text>
            </View>
          ) : (
            groups.map((g) => (
              <View key={g.label} style={{ marginTop: 18 }}>
                <Text
                  style={{
                    marginBottom: 10,
                    marginLeft: 4,
                    fontSize: 13,
                    fontWeight: "600",
                    color: COLORS.inkSoft,
                  }}
                >
                  {g.label}
                </Text>
                {g.items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <WithdrawModal
        visible={w.withdrawVisible}
        balance={w.balance}
        onClose={w.closeWithdraw}
      />
      <TopupModal visible={w.topupVisible} onClose={w.closeTopup} />

      <LoadingOverlay
        visible={w.isInitialLoading}
        fullscreen
        text="Đang tải ví của bạn..."
      />
    </View>
  );
}
