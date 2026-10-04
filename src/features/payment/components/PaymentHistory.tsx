import { ScreenHeader } from "@/components/common/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    COLORS,
    ON_DARK,
    OVERLAY,
    RADIUS,
    SHADOWS,
    TREND,
} from "@/constants/theme";
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
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Feather>["name"];

type FilterOption<T extends string> = { key: T; label: string; icon: IconName };

const SOURCE_OPTIONS: FilterOption<PaymentHistorySource>[] = [
  { key: "all", label: "Tất cả loại", icon: "layers" },
  { key: "wallet", label: "Qua ví", icon: "briefcase" },
  { key: "online", label: "Online", icon: "credit-card" },
];

const STATUS_OPTIONS: FilterOption<PaymentHistoryStatusFilter>[] = [
  { key: "all", label: "Mọi trạng thái", icon: "list" },
  { key: "paid", label: "Đã thanh toán", icon: "check-circle" },
  { key: "pending", label: "Chờ thanh toán", icon: "clock" },
  { key: "cancelled", label: "Đã hủy", icon: "x-circle" },
  { key: "refunded", label: "Đã hoàn", icon: "rotate-ccw" },
];

const EMPTY_TEXT: Record<PaymentHistorySource, string> = {
  all: "Chưa có giao dịch thanh toán nào.",
  wallet: "Chưa có giao dịch nào qua ví.",
  online: "Chưa có thanh toán online nào.",
};

// Trạng thái khác SUCCESS thì hiện badge; SUCCESS thì không cần.
const BADGE: Partial<Record<PaymentHistoryStatus, { bg: string; fg: string }>> =
  {
    PENDING: { bg: COLORS.accentLight, fg: COLORS.accentDark },
    FAILED: { bg: COLORS.dangerLight, fg: COLORS.danger },
    CANCELLED: { bg: COLORS.dangerLight, fg: COLORS.danger },
    REFUNDED: { bg: COLORS.infoLight, fg: COLORS.infoDark },
  };

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

type Section = { title: string; data: PaymentHistoryItem[] };

function groupByDay(list: PaymentHistoryItem[]): Section[] {
  const groups: Section[] = [];
  for (const item of list) {
    const title = dayLabel(item.created_at);
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.data.push(item);
    else groups.push({ title, data: [item] });
  }
  return groups;
}

/* ============================ dropdown lọc ============================ */

function FilterDropdown<T extends string>({
  caption,
  value,
  options,
  onChange,
}: {
  caption: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (key: T) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value) ?? options[0];
  const active = value !== options[0].key;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: active ? COLORS.primaryLight : COLORS.canvas,
          borderWidth: 1,
          borderColor: active ? COLORS.primary : COLORS.line,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? COLORS.primary : COLORS.surface,
          }}
        >
          <Feather
            name={current.icon}
            size={16}
            color={active ? COLORS.white : COLORS.inkSoft}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 11, color: COLORS.inkMuted }}>
            {caption}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              marginTop: 1,
              fontSize: 13.5,
              fontWeight: "700",
              color: active ? COLORS.primaryDark : COLORS.ink,
            }}
          >
            {current.label}
          </Text>
        </View>
        <Feather
          name="chevron-down"
          size={18}
          color={active ? COLORS.primaryDark : COLORS.inkMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: OVERLAY,
          }}
        >
          {/* Pressable rỗng để chạm vào sheet không đóng modal */}
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: RADIUS.sheet,
              borderTopRightRadius: RADIUS.sheet,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.line,
              }}
            />
            <Text
              style={{
                marginTop: 16,
                marginBottom: 12,
                fontSize: 17,
                fontWeight: "800",
                color: COLORS.ink,
              }}
            >
              {caption}
            </Text>

            {options.map((o) => {
              const selected = o.key === value;
              return (
                <TouchableOpacity
                  key={o.key}
                  activeOpacity={0.8}
                  onPress={() => {
                    onChange(o.key);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    marginBottom: 6,
                    borderRadius: 16,
                    backgroundColor: selected
                      ? COLORS.primaryLight
                      : "transparent",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected
                        ? COLORS.primary
                        : COLORS.canvas,
                    }}
                  >
                    <Feather
                      name={o.icon}
                      size={17}
                      color={selected ? COLORS.white : COLORS.inkSoft}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 15,
                      fontWeight: selected ? "800" : "600",
                      color: selected ? COLORS.primaryDark : COLORS.ink,
                    }}
                  >
                    {o.label}
                  </Text>
                  {selected && (
                    <Feather name="check" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ============================ thẻ tổng kết ============================ */

function StatTile({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 18,
        backgroundColor: ON_DARK.surface,
        borderWidth: 1,
        borderColor: ON_DARK.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Feather name={icon} size={13} color={ON_DARK.textSoft} />
        <Text style={{ marginLeft: 6, fontSize: 12, color: ON_DARK.textSoft }}>
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 6,
          fontSize: 16,
          fontWeight: "800",
          color: ON_DARK.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SummaryCard({ totals }: { totals: PaymentHistoryTotals }) {
  return (
    <View
      style={[
        {
          marginTop: 16,
          padding: 20,
          borderRadius: RADIUS.hero,
          backgroundColor: COLORS.primary,
          overflow: "hidden",
        },
        SHADOWS.float,
      ]}
    >
      {/* vòng tròn trang trí */}
      <View
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: ON_DARK.surface,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -50,
          left: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: ON_DARK.surface,
        }}
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: ON_DARK.surface,
          }}
        >
          <Feather name="shield" size={16} color={ON_DARK.text} />
        </View>
        <Text style={{ marginLeft: 10, fontSize: 13, color: ON_DARK.textSoft }}>
          Tổng đã thanh toán
        </Text>
      </View>

      <Text
        style={{
          marginTop: 10,
          fontSize: 32,
          fontWeight: "800",
          color: ON_DARK.text,
        }}
      >
        {formatVnd(totals.paid)}
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
        <StatTile
          icon="rotate-ccw"
          label="Đã hoàn về ví"
          value={formatVnd(totals.refunded)}
        />
        <StatTile
          icon="hash"
          label="Số giao dịch"
          value={String(totals.count)}
        />
      </View>
    </View>
  );
}

/* ============================ dòng giao dịch ============================ */

function HistoryRow({
  item,
  onPress,
}: {
  item: PaymentHistoryItem;
  onPress?: () => void;
}) {
  const isRefund = item.kind === "REFUND";
  const dead = item.status === "FAILED" || item.status === "CANCELLED";
  const tone = isRefund ? TREND.up : COLORS.primaryDark;
  const toneBg = isRefund ? TREND.upBg : COLORS.primaryLight;
  const icon: IconName = isRefund
    ? "rotate-ccw"
    : item.channel === "WALLET"
      ? "briefcase"
      : "credit-card";
  const badge = BADGE[item.status];
  const amountColor = dead ? COLORS.inkMuted : isRefund ? TREND.up : COLORS.ink;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
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
          width: 46,
          height: 46,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: dead ? COLORS.canvas : toneBg,
        }}
      >
        <Feather name={icon} size={20} color={dead ? COLORS.inkMuted : tone} />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14.5, fontWeight: "700", color: COLORS.ink }}
        >
          {item.title}
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <Text style={{ fontSize: 12, color: COLORS.inkMuted }}>
            {item.method_display} · {formatMessageTime(item.created_at)}
          </Text>
          {badge && (
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: badge.bg,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: badge.fg }}
              >
                {item.status_display}
              </Text>
            </View>
          )}
        </View>
        {!!item.note && (
          <Text
            numberOfLines={1}
            style={{ marginTop: 3, fontSize: 12, color: COLORS.inkSoft }}
          >
            {item.note}
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
          {formatVnd(Number(item.amount))}
        </Text>
        {!!onPress && (
          <Feather
            name="chevron-right"
            size={16}
            color={COLORS.inkMuted}
            style={{ marginTop: 4 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SkeletonList() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View
        style={{
          height: 158,
          borderRadius: RADIUS.hero,
          backgroundColor: COLORS.line,
          opacity: 0.55,
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            padding: 14,
            borderRadius: 22,
            backgroundColor: COLORS.surface,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS.line,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor: COLORS.line,
              opacity: 0.6,
            }}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                width: "60%",
                height: 12,
                borderRadius: 6,
                backgroundColor: COLORS.line,
                opacity: 0.6,
              }}
            />
            <View
              style={{
                width: "40%",
                height: 10,
                marginTop: 8,
                borderRadius: 5,
                backgroundColor: COLORS.line,
                opacity: 0.45,
              }}
            />
          </View>
          <View
            style={{
              width: 64,
              height: 14,
              borderRadius: 7,
              backgroundColor: COLORS.line,
              opacity: 0.6,
            }}
          />
        </View>
      ))}
    </View>
  );
}

/* ============================ danh sách ============================ */

function PaymentHistoryList({
  source,
  status,
  onResetFilters,
}: {
  source: PaymentHistorySource;
  status: PaymentHistoryStatusFilter;
  onResetFilters: () => void;
}) {
  const insets = useSafeAreaInsets();
  const h = usePaymentHistory(source, status);
  const sections = useMemo(() => groupByDay(h.items), [h.items]);
  const filtering = source !== "all" || status !== "all";

  if (h.isInitialLoading) return <SkeletonList />;

  if (h.isError) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Không tải được lịch sử thanh toán."
        actionLabel="Thử lại"
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
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 24,
      }}
      refreshControl={
        <RefreshControl
          refreshing={h.refreshing}
          onRefresh={h.onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      onEndReached={h.loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        h.totals ? (
          <View>
            <SummaryCard totals={h.totals} />
            {filtering && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ fontSize: 13, color: COLORS.inkSoft }}>
                  Đang lọc · {h.totals.count} giao dịch
                </Text>
                <TouchableOpacity onPress={onResetFilters} hitSlop={8}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: COLORS.primary,
                    }}
                  >
                    Xóa lọc
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="file-text"
          title={
            filtering
              ? "Không có giao dịch phù hợp với bộ lọc."
              : EMPTY_TEXT.all
          }
          actionLabel={filtering ? "Xóa bộ lọc" : undefined}
          onAction={filtering ? onResetFilters : undefined}
        />
      }
      renderSectionHeader={({ section }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 18,
            marginBottom: 10,
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: COLORS.inkSoft }}
          >
            {section.title}
          </Text>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              marginLeft: 10,
              backgroundColor: COLORS.line,
            }}
          />
        </View>
      )}
      renderItem={({ item }) => (
        <HistoryRow
          item={item}
          onPress={
            item.booking_id
              ? () => router.push(`/booking/${item.booking_id}` as any)
              : undefined
          }
        />
      )}
      ListFooterComponent={
        h.isLoadingMore ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginVertical: 16 }}
          />
        ) : null
      }
    />
  );
}

/* ============================ màn hình ============================ */

export function PaymentHistory() {
  const insets = useSafeAreaInsets();
  const [source, setSource] = useState<PaymentHistorySource>("all");
  const [status, setStatus] = useState<PaymentHistoryStatusFilter>("all");

  const resetFilters = () => {
    setSource("all");
    setStatus("all");
  };

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top }} className="bg-surface">
        <ScreenHeader title="Lịch sử thanh toán" />
      </View>

      {/* Thanh lọc: 2 dropdown nằm ngang */}
      <View
        className="bg-surface border-b border-line"
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <FilterDropdown
          caption="Loại"
          value={source}
          options={SOURCE_OPTIONS}
          onChange={setSource}
        />
        <FilterDropdown
          caption="Trạng thái"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
      </View>

      {/* key theo bộ lọc: đổi bộ lọc thì reset trang và danh sách */}
      <PaymentHistoryList
        key={`${source}-${status}`}
        source={source}
        status={status}
        onResetFilters={resetFilters}
      />
    </View>
  );
}
