import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui";
import { useReviewEditability } from "@/features/review/hooks/useReviewEditability";
import type { Review } from "@/features/review/types/Review";
import {
  formatReviewDate,
  reviewWorkerName,
} from "@/features/review/utils/reviewFormat";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ReviewStars } from "./ReviewStars";

const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

export function ReviewCard({
  review,
  onEdit,
}: {
  review: Review;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();
  const editable = useReviewEditability(review);

  return (
    <View
      style={[
        {
          marginBottom: 16,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {review.worker.avatar ? (
            <Image
              source={{ uri: review.worker.avatar }}
              style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.canvas }}
            />
          ) : (
            <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.canvas }}>
              <Feather name="user" size={20} color={COLORS.inkMuted} />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
              {reviewWorkerName(review)}
            </Text>
            <Text numberOfLines={1} style={{ marginTop: 2, fontSize: 13, fontWeight: "600", color: COLORS.primaryDark }}>
              {t(review.service_name)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: COLORS.accentLight }}>
            <Ionicons name="star" size={13} color={COLORS.accent} />
            <Text style={{ marginLeft: 4, fontSize: 13, fontWeight: "800", color: COLORS.accentDark }}>
              {review.rating}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: COLORS.canvas }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="hash" size={13} color={COLORS.inkMuted} />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ flex: 1, marginLeft: 6, fontSize: 12.5, fontWeight: "700", color: COLORS.ink, fontFamily: MONO }}
            >
              {review.booking_code}  {t("\u00b7 Bu\u1ed5i")} {review.schedule.sequence_no}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Feather name="calendar" size={13} color={COLORS.inkMuted} />
            <Text style={{ marginLeft: 6, fontSize: 12.5, color: COLORS.inkSoft }}>
              {t("Ng\u00e0y l\u00e0m:")}{" "}{formatReviewDate(review.schedule.scheduled_start, t)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <ReviewStars rating={review.rating} />
        </View>

        {!!review.comment && (
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <View style={{ width: 3, borderRadius: 2, backgroundColor: COLORS.primaryBorder, marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: COLORS.ink }}>
              {review.comment}
            </Text>
          </View>
        )}

        {review.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {review.images.map((image) => (
              <Image
                key={image.id}
                source={{ uri: image.image }}
                accessibilityLabel={t("\u1ea2nh \u0111\u00e1nh gi\u00e1")}
                style={{ width: 88, height: 88, borderRadius: 14, marginRight: 8 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {!!review.admin_reply && (
          <View style={{ marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primaryBorder }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Feather name="corner-down-right" size={14} color={COLORS.primaryDark} />
              <Text style={{ marginLeft: 6, fontSize: 12.5, fontWeight: "800", color: COLORS.primaryDark }}>
                {t("Ph\u1ea3n h\u1ed3i t\u1eeb CleanWise")}
              </Text>
            </View>
            <Text style={{ fontSize: 13.5, lineHeight: 20, color: COLORS.inkSoft }}>
              {review.admin_reply}
            </Text>
          </View>
        )}

        {!review.is_visible && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: COLORS.dangerLight }}>
            <Feather name="eye-off" size={14} color={COLORS.danger} />
            <Text style={{ flex: 1, marginLeft: 8, fontSize: 12.5, color: COLORS.danger }}>
              {t("\u0110\u00e1nh gi\u00e1 \u0111ang \u0111\u01b0\u1ee3c \u1ea9n kh\u1ecfi hi\u1ec3n th\u1ecb c\u00f4ng khai.")}
            </Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.line }}>
        <Text style={{ fontSize: 12, color: COLORS.inkMuted }}>
          {t("\u0110\u00e3 g\u1eedi:")}{" "}{formatReviewDate(review.created_at, t)}
          {review.is_edited ? t(" \u00b7 \u0110\u00e3 ch\u1ec9nh s\u1eeda") : ""}
        </Text>
        <Text style={{ marginTop: 3, fontSize: 12, color: editable ? COLORS.primaryDark : COLORS.inkMuted }}>
          {editable
            ? t("C\u00f3 th\u1ec3 s\u1eeda \u0111\u1ebfn {{value0}}", { value0: formatReviewDate(review.edit_deadline, t) })
            : t("\u0110\u00e3 h\u1ebft th\u1eddi h\u1ea1n ch\u1ec9nh s\u1eeda")}
        </Text>
        {editable && (
          <View style={{ marginTop: 10 }}>
            <Button title={t("Ch\u1ec9nh s\u1eeda \u0111\u00e1nh gi\u00e1")} variant="soft" icon="edit-3" onPress={onEdit} />
          </View>
        )}
      </View>
    </View>
  );
}