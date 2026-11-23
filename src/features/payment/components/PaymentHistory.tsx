import { safePush } from "@/utils/navigation";
import { getLocale } from "@/features/language/i18n";
import { localizeTransactionNote } from "@/features/payment/utils/localizeTransactionNote";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ON_DARK, RADIUS } from "@/constants/theme";
import type {
  PaymentHistoryItem,
  PaymentHistorySource,
  PaymentHistoryStatus,
  PaymentHistoryStatusFilter,
} from "@/features/payment/api/paymentHistoryApi";
import {
  usePaymentHistory,
  type PaymentHistoryTotals,
} from "@/features/payment/hooks/usePaymentHistory";
import { formatVnd } from "@/utils/currency";
import { formatMessageTime } from "@/utils/formatTime";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Feather>["name"];

type FilterOption<T extends string> = { key: T; label: string; icon: IconName };

const PAGE_STEP = 10;
const HAIR = StyleSheet.hairlineWidth;

function getSourceOptions(t: (k: string) => string): FilterOption<PaymentHistorySource>[] {
  return [
    { key: "all", label: t("T\u1ea5t c\u1ea3 lo\u1ea1i"), icon: "layers" },
    { key: "wallet", label: t("Qua v\u00ed"), icon: "briefcase" },
    { key: "online", label: "Online", icon: "credit-card" },
  ];
}

function getStatusOptions(t: (k: string) => string): FilterOption<PaymentHistoryStatusFilter>[] {
  return [
    { key: "all", label: t("M\u1ecdi tr\u1ea1ng th\u00e1i"), icon: "list" },
    { key: "paid", label: t("\u0110\u00e3 thanh to\u00e1n"), icon: "check-circle" },
    { key: "pending", label: t("Ch\u1edd thanh to\u00e1n"), icon: "clock" },
    { key: "cancelled", label: t("\u0110\u00e3 h\u1ee7y"), icon: "x-circle" },
    { key: "refunded", label: t("\u0110\u00e3 ho\u00e0n"), icon: "rotate-ccw" },
  ];
}

const dayLabel = (iso: string, t: (k: string) => string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t("H\u00f4m nay");
  if (d.toDateString() === yesterday.toDateString()) return t("H\u00f4m qua");
  return d.toLocaleDateString(getLocale(t as any), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

type Section = { title: string; data: PaymentHistoryItem[] };

function groupByDay(list: PaymentHistoryItem[], t: (k: string) => string): Section[] {
  const groups: Section[] = [];
  for (const item of list) {
    const title = dayLabel(item.created_at, t);
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.data.push(item);
    else groups.push({ title, data: [item] });
  }
  return groups;
}

/* ============================ dropdown loc ============================ */

function FilterButton<T extends string>({
  caption,
  value,
  options,
  open,
  onPress,
}: {
  caption: string;
  value: T;
  options: FilterOption<T>[];
  open: boolean;
  onPress: () => void;
}) {
  const { COLORS } = useAppTheme();
  const current = options.find((o) => o.key === value) ?? options[0];
  const active = value !== options[0].key;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: active ? COLORS.primaryLight : COLORS.canvas,
        borderWidth: 1,
        borderColor: active || open ? COLORS.primary : COLORS.line,
      }}
    >
      <Feather name={current.icon} size={16} color={active ? COLORS.primaryDark : COLORS.inkSoft} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 11, color: COLORS.inkMuted }}>{caption}</Text>
        <Text
          numberOfLines={1}
          style={{ marginTop: 1, fontSize: 13.5, fontWeight: "700", color: active ? COLORS.primaryDark : COLORS.ink }}
        >
          {current.label}
        </Text>
      </View>
      <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={active ? COLORS.primaryDark : COLORS.inkMuted} />
    </TouchableOpacity>
  );
}

function FilterPanel<T extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  const { COLORS } = useAppTheme();

  return (
    <View
      style={{
        marginTop: 10,
        padding: 6,
        borderRadius: 18,
        backgroundColor: COLORS.canvas,
        borderWidth: 1,
        borderColor: COLORS.line,
      }}
    >
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            activeOpacity={0.8}
            onPress={() => onChange(o.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 11,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: selected ? COLORS.primaryLight : "transparent",
            }}
          >
            <Feather name={o.icon} size={16} color={selected ? COLORS.primaryDark : COLORS.inkSoft} />
            <Text
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 14,
                fontWeight: selected ? "800" : "600",
                color: selected ? COLORS.primaryDark : COLORS.ink,
              }}
            >
              {o.label}
            </Text>
            {selected && <Feather name="check" size={16} color={COLORS.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
/* ============================ the tong ket ============================ */

function SummaryStat({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Feather name={icon} size={13} color={ON_DARK.textSoft} />
        <Text style={{ marginLeft: 6, fontSize: 12, color: ON_DARK.textSoft }}>{label}</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ marginTop: 5, fontSize: 16, fontWeight: "800", color: ON_DARK.text }}>
        {value}
      </Text>
    </View>
  );
}

function SummaryCard({ totals }: { totals: PaymentHistoryTotals }) {
  const { t } = useTranslation();
  const { GRADIENTS, SHADOWS } = useAppTheme();

  return (
    <View style={[{ marginTop: 16, borderRadius: RADIUS.hero, backgroundColor: GRADIENTS.wallet[0] }, SHADOWS.float]}>
      <LinearGradient
        colors={GRADIENTS.wallet}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20, borderRadius: RADIUS.hero, overflow: "hidden" }}
      >
        <View pointerEvents="none" style={{ position: "absolute", top: -50, right: -40, width: 170, height: 170, borderRadius: 85, backgroundColor: ON_DARK.surface }} />
        <View pointerEvents="none" style={{ position: "absolute", bottom: -60, left: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: ON_DARK.surface }} />

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: ON_DARK.surface, borderWidth: 1, borderColor: ON_DARK.border }}>
            <Feather name="check-circle" size={17} color={ON_DARK.text} />
          </View>
          <Text style={{ marginLeft: 10, fontSize: 13.5, fontWeight: "600", color: ON_DARK.textSoft }}>
            {t("T\u1ed5ng \u0111\u00e3 thanh to\u00e1n")}
          </Text>
        </View>

        <Text numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 12, fontSize: 36, lineHeight: 44, fontWeight: "800", color: ON_DARK.text }}>
          {formatVnd(totals.paid, t)}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, paddingVertical: 12, borderRadius: 18, backgroundColor: ON_DARK.surface }}>
          <SummaryStat icon="rotate-ccw" label={t("\u0110\u00e3 ho\u00e0n v\u1ec1 v\u00ed")} value={formatVnd(totals.refunded, t)} />
          <View style={{ width: 1, height: 30, backgroundColor: ON_DARK.border }} />
          <SummaryStat icon="hash" label={t("S\u1ed1 giao d\u1ecbch")} value={String(totals.count)} />
        </View>
      </LinearGradient>
    </View>
  );
}

/* ============================ dong giao dich ============================ */

function HistoryRow({
  item,
  first,
  last,
  onPress,
}: {
  item: PaymentHistoryItem;
  first: boolean;
  last: boolean;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS, TREND } = useAppTheme();

  const BADGE: Partial<Record<PaymentHistoryStatus, { bg: string; fg: string }>> = {
    PENDING: { bg: COLORS.accentLight, fg: COLORS.accentDark },
    FAILED: { bg: COLORS.dangerLight, fg: COLORS.danger },
    CANCELLED: { bg: COLORS.dangerLight, fg: COLORS.danger },
    REFUNDED: { bg: COLORS.infoLight, fg: COLORS.infoDark },
  };

  const isRefund = item.kind === "REFUND";
  const dead = item.status === "FAILED" || item.status === "CANCELLED";
  const tone = isRefund ? TREND.up : COLORS.primaryDark;
  const toneBg = isRefund ? TREND.upBg : COLORS.primaryLight;
  const icon: IconName = isRefund ? "rotate-ccw" : item.channel === "WALLET" ? "briefcase" : "credit-card";
  const badge = BADGE[item.status];
  const amountColor = dead ? COLORS.inkMuted : isRefund ? TREND.up : COLORS.ink;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.line,
        borderLeftWidth: HAIR,
        borderRightWidth: HAIR,
        borderTopWidth: first ? HAIR : 0,
        borderBottomWidth: HAIR,
        borderTopLeftRadius: first ? 20 : 0,
        borderTopRightRadius: first ? 20 : 0,
        borderBottomLeftRadius: last ? 20 : 0,
        borderBottomRightRadius: last ? 20 : 0,
        opacity: dead ? 0.75 : 1,
      }}
    >
      <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: dead ? COLORS.canvas : toneBg }}>
        <Feather name={icon} size={20} color={dead ? COLORS.inkMuted : tone} />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={Boolean(item.booking_code)}
          minimumFontScale={0.7}
          style={{ fontSize: 14.5, fontWeight: "700", color: COLORS.ink }}
        >
          {item.booking_code
            ? t(item.kind === "REFUND" ? "Ho\u00e0n ti\u1ec1n \u0111\u01a1n {{value0}}" : "Thanh to\u00e1n \u0111\u01a1n {{value0}}", { value0: item.booking_code })
            : t(item.kind === "REFUND" ? "Ho\u00e0n ti\u1ec1n v\u00e0o v\u00ed" : "Thanh to\u00e1n b\u1eb1ng v\u00ed")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Feather name="clock" size={11} color={COLORS.inkMuted} />
          <Text numberOfLines={1} style={{ flex: 1, marginLeft: 4, fontSize: 12, color: COLORS.inkMuted }}>
            {t(item.method_display)} {"\u00b7"} {formatMessageTime(item.created_at, t)}
          </Text>
        </View>
        {!!item.note && (
          <Text numberOfLines={1} style={{ marginTop: 3, fontSize: 12, color: COLORS.inkSoft }}>
            {localizeTransactionNote(item.note, t)}
          </Text>
        )}
      </View>

      <View style={{ marginLeft: 8, alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 15.5,
            fontWeight: "800",
            color: amountColor,
            textDecorationLine: dead ? "line-through" : "none",
          }}
        >
          {isRefund ? "+" : "-"}
          {formatVnd(Number(item.amount), t)}
        </Text>
        {badge ? (
          <View style={{ marginTop: 5, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: badge.bg }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: badge.fg }}>{t(item.status_display)}</Text>
          </View>
        ) : !!onPress ? (
          <Feather name="chevron-right" size={16} color={COLORS.inkMuted} style={{ marginTop: 4 }} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function SkeletonList() {
  const { COLORS } = useAppTheme();
  const bar = (w: any, h: number, o = 0.6) => (
    <View style={{ width: w, height: h, borderRadius: h / 2, backgroundColor: COLORS.line, opacity: o }} />
  );

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ height: 190, borderRadius: RADIUS.hero, backgroundColor: COLORS.line, opacity: 0.55 }} />
      <View style={{ marginTop: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: HAIR, borderColor: COLORS.line }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: i < 3 ? HAIR : 0, borderBottomColor: COLORS.line }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.line, opacity: 0.6 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              {bar("60%", 12)}
              <View style={{ height: 8 }} />
              {bar("40%", 10, 0.45)}
            </View>
            {bar(64, 14)}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ============================ danh sach ============================ */

function PaymentHistoryList({
  source,
  status,
  onResetFilters,
}: {
  source: PaymentHistorySource;
  status: PaymentHistoryStatusFilter;
  onResetFilters: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();
  const insets = useSafeAreaInsets();
  const h = usePaymentHistory(source, status);
  const [visible, setVisible] = useState(PAGE_STEP);

  const sections = useMemo(() => groupByDay(h.items.slice(0, visible), t), [h.items, visible, t]);
  const filtering = source !== "all" || status !== "all";

  const total = h.totals?.count ?? h.items.length;
  const shown = Math.min(visible, total);
  const remaining = Math.max(0, total - shown);

  const showMore = () => {
    const next = visible + PAGE_STEP;
    setVisible(next);
    if (next > h.items.length && h.items.length < total) h.loadMore();
  };

  if (h.isInitialLoading) return <SkeletonList />;

  if (h.isError) {
    return (
      <EmptyState
        icon="alert-circle"
        title={t("Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c l\u1ecbch s\u1eed thanh to\u00e1n.")}
        actionLabel={t("Th\u1eed l\u1ea1i")}
        onAction={() => h.retry()}
      />
    );
  }

  return (
    <SectionList
      style={{ flex: 1 }}
      sections={sections}
      keyExtractor={(it) => it.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
      refreshControl={
        <RefreshControl
          refreshing={h.refreshing}
          onRefresh={h.onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primaryFill]}
        />
      }
      ListHeaderComponent={
        h.totals ? (
          <View>
            <SummaryCard totals={h.totals} />
            {filtering && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
                  {t("\u0110ang l\u1ecdc \u00b7")} {h.totals.count} {t("giao d\u1ecbch")}
                </Text>
                <TouchableOpacity onPress={onResetFilters} hitSlop={8}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.primary }}>{t("X\u00f3a l\u1ecdc")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        <EmptyState
          icon="file-text"
          title={filtering ? t("Kh\u00f4ng c\u00f3 giao d\u1ecbch ph\u00f9 h\u1ee3p v\u1edbi b\u1ed9 l\u1ecdc.") : t("Ch\u01b0a c\u00f3 giao d\u1ecbch thanh to\u00e1n n\u00e0o.")}
          actionLabel={filtering ? t("X\u00f3a b\u1ed9 l\u1ecdc") : undefined}
          onAction={filtering ? onResetFilters : undefined}
        />
      }
      renderSectionHeader={({ section }) => (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 10, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft }}>{section.title}</Text>
          <View style={{ flex: 1, height: HAIR, marginLeft: 10, backgroundColor: COLORS.line }} />
        </View>
      )}
      renderItem={({ item, index, section }) => (
        <HistoryRow
          item={item}
          first={index === 0}
          last={index === section.data.length - 1}
          onPress={item.booking_id ? () => safePush(`/booking/${item.booking_id}` as any) : undefined}
        />
      )}
      ListFooterComponent={
        h.isLoadingMore ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
        ) : remaining > 0 ? (
          <TouchableOpacity
            onPress={showMore}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 46,
              marginTop: 18,
              borderRadius: 999,
              backgroundColor: COLORS.ink,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.surface }}>
              {t("Xem th\u00eam")} ({Math.min(PAGE_STEP, remaining)})
            </Text>
            <Feather name="chevron-down" size={16} color={COLORS.surface} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ) : undefined
      }
    />
  );
}

/* ============================ man hinh ============================ */

export function PaymentHistory() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<PaymentHistorySource>("all");
  const [status, setStatus] = useState<PaymentHistoryStatusFilter>("all");
  const [openKey, setOpenKey] = useState<"source" | "status" | null>(null);

  const resetFilters = () => {
    setSource("all");
    setStatus("all");
  };

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <ScreenHeader title={t("L\u1ecbch s\u1eed thanh to\u00e1n")} />
      </View>

      <View
        className="bg-surface border-b border-line"
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <FilterButton
            caption={t("Lo\u1ea1i")}
            value={source}
            options={getSourceOptions(t)}
            open={openKey === "source"}
            onPress={() => setOpenKey(openKey === "source" ? null : "source")}
          />
          <FilterButton
            caption={t("Tr\u1ea1ng th\u00e1i")}
            value={status}
            options={getStatusOptions(t)}
            open={openKey === "status"}
            onPress={() => setOpenKey(openKey === "status" ? null : "status")}
          />
        </View>
        {openKey === "source" && (
          <FilterPanel
            options={getSourceOptions(t)}
            value={source}
            onChange={(k) => { setSource(k); setOpenKey(null); }}
          />
        )}
        {openKey === "status" && (
          <FilterPanel
            options={getStatusOptions(t)}
            value={status}
            onChange={(k) => { setStatus(k); setOpenKey(null); }}
          />
        )}
      </View>

      <PaymentHistoryList key={`${source}-${status}`} source={source} status={status} onResetFilters={resetFilters} />
    </View>
  );
}