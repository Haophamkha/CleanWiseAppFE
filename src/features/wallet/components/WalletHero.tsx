import { safePush } from "@/utils/navigation";
import { useTranslation } from "react-i18next";
import { getLocale } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ON_DARK, RADIUS } from "@/constants/theme";
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
        stroke={ON_DARK.text}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrendBadge({ net }: { net: number }) {
  const { t } = useTranslation();
  const { COLORS, TREND, isDark } = useAppTheme();

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
        backgroundColor: isDark ? (up ? TREND.upBg : TREND.downBg) : COLORS.white,
      }}
    >
      <Feather
        name={up ? "trending-up" : "trending-down"}
        size={14}
        color={color}
      />
      <Text style={{ marginLeft: 6, fontSize: 12.5, fontWeight: "800", color }}>
        {up ? "+" : "-"}
        {formatVnd(Math.abs(net), t)}
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
  const { COLORS, SHADOWS, isDark } = useAppTheme();

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
          backgroundColor: isDark ? COLORS.surfaceMuted : COLORS.primaryLight,
        }}
      >
        <Feather name={icon} size={20} color={isDark ? COLORS.inkSoft : COLORS.primaryDark} />
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
  const { t } = useTranslation();

  const { COLORS, GRADIENTS, SHADOWS } = useAppTheme();

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
          {t("Ví của tôi")}</Text>
        {isBackgroundFetching && (
          <ActivityIndicator color={COLORS.primary} size="small" />
        )}
      </View>

      {/* Th hero-card */}
      <View style={[{ borderRadius: RADIUS.hero, backgroundColor: COLORS.primaryFill }, SHADOWS.float]}>
        <LinearGradient
          colors={GRADIENTS.wallet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22, borderRadius: RADIUS.hero, overflow: "hidden" }}
        >
          <View pointerEvents="none" style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, right: -50, top: -60, backgroundColor: ON_DARK.surface }} />
          <View pointerEvents="none" style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, left: -40, bottom: -50, backgroundColor: ON_DARK.surface }} />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: ON_DARK.surface, borderWidth: 1, borderColor: ON_DARK.border }}>
              <Feather name="pocket" size={18} color={ON_DARK.text} />
            </View>
            <Text style={{ flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "600", color: ON_DARK.textSoft }}>
              {t("S\u1ed1 d\u01b0 kh\u1ea3 d\u1ee5ng")}
            </Text>
            {trend.hasData && <TrendBadge net={trend.net} />}
          </View>

          {isInitialLoading ? (
            <View style={{ height: 70 }} />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 14 }}>
              <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 44, lineHeight: 54, fontWeight: "800", color: ON_DARK.text }}>
                {balance.toLocaleString(getLocale(t))}
              </Text>
              <Text style={{ marginLeft: 4, fontSize: 22, fontWeight: "700", color: ON_DARK.textSoft }}>
                {t("\u0111")}
              </Text>
            </View>
          )}

          {trend.hasData && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: ON_DARK.surface }}>
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: ON_DARK.textSoft }}>
                {t("Bi\u1ebfn \u0111\u1ed9ng")} {DAYS} {t("ng\u00e0y qua")}
              </Text>
              <Sparkline series={trend.series} />
            </View>
          )}
        </LinearGradient>
      </View>

      {/* 3 nút riêng */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Tile icon="plus" label={t("Nạp tiền")} onPress={onTopup} />
        {onWithdraw && (
          <Tile icon="arrow-up-right" label={t("Rút tiền")} onPress={onWithdraw} />
        )}
        <Tile
          icon="credit-card"
          label={t("Ngân hàng")}
          onPress={() => safePush("/profile/payment-methods" as any)}
        />
      </View>
    </View>
  );
}
