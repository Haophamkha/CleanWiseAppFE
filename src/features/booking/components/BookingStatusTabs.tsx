import { useTranslation } from "react-i18next";
import { SHADOWS } from "@/constants/theme";
import type { BookingTab } from "@/features/booking/hooks/useBookingList";
import { getLocalizedBookingStatusTabs } from "@/features/booking/utils/bookingStatus";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export function BookingStatusTabs({
  value,
  onChange,
}: {
  value: BookingTab;
  onChange: (tab: BookingTab) => void;
}) {
  const { t } = useTranslation();

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
      {getLocalizedBookingStatusTabs().map((tab) => {
        const selected = value === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.85}
            className={`h-10 px-5 rounded-full border items-center justify-center ${
              selected ? "bg-primary-fill border-primary" : "bg-surface border-line"
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
