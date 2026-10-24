import { useTranslation } from "react-i18next";
import { translate as t, getLocale } from "@/features/language/i18n";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Badge, Card } from "@/components/ui";

import type { BookingListItem } from "@/features/booking/types/Booking";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

function getLocalizedStatus(): Record<
  string,
  { label: string; tone: "accent" | "primary" | "success" }
> {
  return {
    PENDING: { label: t("Chờ nhận việc"), tone: "accent" },
    ASSIGNED: { label: t("Đã có nhân viên"), tone: "primary" },
    IN_PROGRESS: { label: t("Đang thực hiện"), tone: "success" },
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

  const { COLORS } = useAppTheme();

  const status = getLocalizedStatus()[booking.status] ?? getLocalizedStatus().PENDING;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} className="mb-3">
      <Card className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary-light items-center justify-center mr-3">
          <Feather name="calendar" size={20} color={COLORS.primary} />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-ink" numberOfLines={1}>
            {booking.service_name}
          </Text>
          <Text className="text-xs text-ink-muted mt-0.5">
            {t("Mã")}{" "}{booking.booking_code}
          </Text>
        </View>
        <View className="items-end">
          <View className="self-end">
            <Badge label={status.label} tone={status.tone} />
          </View>
          {booking.total_amount ? (
            <Text className="text-sm font-bold text-primary mt-2">
              {Number(booking.total_amount).toLocaleString(getLocale())}{t("đ")}</Text>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
