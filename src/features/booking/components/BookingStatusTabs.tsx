import type { BookingTab } from "@/features/booking/hooks/useBookingList";
import { getLocalizedBookingStatusTabs } from "@/features/booking/utils/bookingStatus";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export function BookingStatusTabs({
  value,
  onChange,
  counts,
}: {
  value: BookingTab;
  onChange: (tab: BookingTab) => void;
  counts?: Partial<Record<BookingTab, number>>;
}) {
  const { t } = useTranslation();
  const { COLORS } = useAppTheme();

  return (
    <View
      className="bg-surface"
      style={{ borderBottomWidth: 1, borderBottomColor: COLORS.line }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 8, alignItems: "center" }}
      >
        {getLocalizedBookingStatusTabs(t).map((tab) => {
          const selected = value === tab.key;
          const count = counts?.[tab.key] ?? 0;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingTop: 14,
                paddingBottom: 12,
                borderBottomWidth: 3,
                borderBottomColor: selected ? COLORS.primary : "transparent",
                marginBottom: -1,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 20,
                  fontWeight: selected ? "700" : "500",
                  color: selected ? COLORS.primary : COLORS.inkSoft,
                }}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={{
                    marginLeft: 6,
                    minWidth: 20,
                    height: 20,
                    paddingHorizontal: 6,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected
                      ? COLORS.primary
                      : COLORS.surfaceMuted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      lineHeight: 14,
                      fontWeight: "700",
                      color: selected ? COLORS.white : COLORS.inkSoft,
                    }}
                  >
                    {count > 99 ? "99+" : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
