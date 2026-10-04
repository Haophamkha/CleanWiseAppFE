import {
  COLORS,
  GRADIENTS,
  ON_DARK,
  RADIUS,
  SHADOWS,
  TREND,
} from "@/constants/theme";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polyline } from "react-native-svg";

type Tx = {
  amount: string | number;
  direction: string;
  status: string;
  created_at: string;
};

type Props = {
  balance: number;
  isInitialLoading: boolean;
  isBackgroundFetching: boolean;
  /** Dùng để tính biến động 7 ngày. Không truyền = ẩn huy hiệu và đồ thị */
  transactions?: Tx[];
  /** Không truyền = ẩn nút "Rút tiền" */
  onWithdraw?: () => void;
  onTopup: () => void;
};

const DAYS = 7;

/** Biến động ròng + chuỗi số dư tích lũy theo từng ngày (chỉ giao dịch thành công) */
function useTrend(transactions: Tx[] = []) {
  return useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (DAYS - 1));

    const perDay = Array(DAYS).fill(0);
    let hasData = false;
    for (const t of transactions) {
      if (t.status !== "SUCCESS") continue;
      const d = new Date(t.created_at);
      d.setHours(0, 0, 0, 0);
      const idx = Math.round((d.getTime() - start.getTime()) / 86400000);
      if (idx < 0 || idx >= DAYS) continue;
      const v = Number(t.amount) || 0;
      perDay[idx] += t.direction === "CREDIT" ? v : -v;
      hasData = true;
    }
    let run = 0;
    const series = perDay.map((v) => (run += v));
    return { net: run, series, hasData };
  }, [transactions]);
}

function Sparkline({ series }: { series: number[] }) {
  const W = 96;
  const H = 36;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W;
      const y = H - 4 - ((v - min) / span) * (H - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <Svg width={W} height={H}>
      <Polyline
        points={pts}
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrendBadge({ net }: { net: number }) {
  const up = net >= 0;
  const color = up ? TREND.up : TREND.down;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: COLORS.white,
      }}
    >
      <Feather
        name={up ? "trending-up" : "trending-down"}
        size={14}
        color={color}
      />
      <Text style={{ marginLeft: 6, fontSize: 12.5, fontWeight: "800", color }}>
        {up ? "+" : "-"}
        {formatVnd(Math.abs(net))}
      </Text>
    </View>
  );
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flex: 1,
          alignItems: "center",
          paddingVertical: 16,
          borderRadius: RADIUS.card + 4,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.primaryLight,
        }}
      >
        <Feather name={icon} size={20} color={COLORS.primaryDark} />
      </View>
      <Text
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: "700",
          color: COLORS.ink,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function WalletHero({
  balance,
  isInitialLoading,
  isBackgroundFetching,
  transactions,
  onWithdraw,
  onTopup,
}: Props) {
  const insets = useSafeAreaInsets();
  const trend = useTrend(transactions);

  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
      {/* Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS.line,
            marginRight: 12,
          }}
        >
          <Feather name="arrow-left" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            fontSize: 22,
            fontWeight: "800",
            color: COLORS.ink,
          }}
        >
          Ví của tôi
        </Text>
        {isBackgroundFetching && (
          <ActivityIndicator color={COLORS.primary} size="small" />
        )}
      </View>

      {/* Thẻ số dư */}
      <LinearGradient
        colors={GRADIENTS.wallet}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ padding: 24, borderRadius: RADIUS.hero }, SHADOWS.float]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: "500",
              color: ON_DARK.textSoft,
            }}
          >
            Số dư khả dụng
          </Text>
          {trend.hasData && <TrendBadge net={trend.net} />}
        </View>

        {isInitialLoading ? (
          <View style={{ height: 62 }} />
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 8,
            }}
          >
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                fontSize: 46,
                lineHeight: 56,
                fontWeight: "800",
                color: ON_DARK.text,
              }}
            >
              {balance.toLocaleString("vi-VN")}
            </Text>
            <Text
              style={{
                marginLeft: 4,
                fontSize: 24,
                fontWeight: "700",
                color: ON_DARK.textSoft,
              }}
            >
              đ
            </Text>
          </View>
        )}

        {trend.hasData && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 12.5, color: ON_DARK.textSoft }}>
              Biến động {DAYS} ngày qua
            </Text>
            <Sparkline series={trend.series} />
          </View>
        )}
      </LinearGradient>

      {/* 3 nút riêng */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Tile icon="plus" label="Nạp tiền" onPress={onTopup} />
        {onWithdraw && (
          <Tile icon="arrow-up-right" label="Rút tiền" onPress={onWithdraw} />
        )}
        <Tile
          icon="credit-card"
          label="Ngân hàng"
          onPress={() => router.push("/profile/payment-methods" as any)}
        />
      </View>
    </View>
  );
}
