import { translate as defaultTranslate, getLocale } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Badge } from "@/components/ui";

import type { BookingListItem } from "@/features/booking/types/Booking";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type Tone = "accent" | "primary" | "success";

function getLocalizedStatus(translateText = defaultTranslate): Record<
  string,
  { label: string; tone: Tone }
> {
  return {
    PENDING: { label: translateText("Ch\u1EDD nh\u1EADn vi\u1EC7c"), tone: "accent" },
    ASSIGNED: { label: translateText("\u0110\u00E3 c\u00F3 nh\u00E2n vi\u00EAn"), tone: "primary" },
    IN_PROGRESS: { label: translateText("\u0110ang th\u1EF1c hi\u1EC7n"), tone: "success" },
  };
}

export function ActiveBookingCard({
  booking,
  onPress,
}: {
  booking: BookingListItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const map = getLocalizedStatus(t);
  const status = map[booking.status] ?? map.PENDING;
  const accent =
    status.tone === "accent"
      ? COLORS.accent
      : status.tone === "success"
        ? COLORS.success
        : COLORS.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} className="mb-3">
      <View
        style={[
          {
            flexDirection: "row",
            backgroundColor: COLORS.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: COLORS.line,
            overflow: "hidden",
          },
          SHADOWS.card,
        ]}
      >
        <View style={{ width: 5, backgroundColor: accent }} />
        <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              className="flex-1 mr-2 text-base font-extrabold text-ink"
              numberOfLines={1}
            >
              {t(booking.service_name)}
            </Text>
            <Badge label={status.label} tone={status.tone} />
          </View>

          <Text className="text-xs text-ink-muted mt-1" numberOfLines={1}>
            {t("M\u00E3")} {booking.booking_code}
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: COLORS.line,
              marginVertical: 10,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {booking.total_amount ? (
              <Text className="text-base font-extrabold text-primary">
                {Number(booking.total_amount).toLocaleString(getLocale(t))}
                {t("\u0111")}
              </Text>
            ) : (
              <View />
            )}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text className="text-xs font-semibold text-primary mr-1">
                {t("Xem chi ti\u1EBFt")}
              </Text>
              <Feather name="chevron-right" size={14} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}