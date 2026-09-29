import { SHADOWS } from "@/constants/theme";
import type { BookingTab } from "@/features/booking/hooks/useBookingList";
import { BOOKING_STATUS_TABS } from "@/utils/bookingStatus";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export function BookingStatusTabs({
  value,
  onChange,
}: {
  value: BookingTab;
  onChange: (tab: BookingTab) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        alignItems: "center",
      }}
    >
      {BOOKING_STATUS_TABS.map((tab) => {
        const selected = value === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.85}
            className={`h-10 px-5 rounded-full border items-center justify-center ${
              selected ? "bg-primary border-primary" : "bg-surface border-line"
            }`}
            style={selected ? SHADOWS.float : undefined}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? "text-white" : "text-ink-soft"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
