import { safePush } from "@/utils/navigation";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
// src/features/favorite-worker/components/WorkerCard.tsx
import type { FavoriteWorker } from "@/features/favorite-worker/types/FavoriteWorker";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FavoriteHeartButton } from "./FavoriteHeartButton";

const AVATAR = 64;

function Stat({ icon, label }: { icon: any; label: string }) {
  const { COLORS } = useAppTheme();

  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <Feather name={icon} size={15} color={COLORS.primary} />
      <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 13, fontWeight: "600", color: COLORS.inkSoft }}>
        {label}
      </Text>
    </View>
  );
}

export function WorkerCard({
  worker,
  removing,
  onRemove,
}: {
  worker: FavoriteWorker;
  removing: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { COLORS, SHADOWS } = useAppTheme();

  const fullName =
    `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim() ||
    t("Nh\u00e2n vi\u00ean");
  const rating = Number(worker.average_rating ?? 0);
  const hasRating = worker.total_completed_jobs > 0 && rating > 0;

  const openProfile = () => {
    safePush({
      pathname: "/worker/[id]",
      params: {
        id: String(worker.worker_id),
        data: JSON.stringify(worker),
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openProfile}
      style={[
        {
          marginBottom: 14,
          borderRadius: 24,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        {worker.avatar ? (
          <Image
            source={{ uri: worker.avatar }}
            style={{ width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, backgroundColor: COLORS.canvas }}
          />
        ) : (
          <View
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: AVATAR / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.canvas,
            }}
          >
            <Feather name="user" size={26} color={COLORS.inkMuted} />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 14, marginRight: 10 }}>
          <Text numberOfLines={1} style={{ fontSize: 17.5, fontWeight: "800", color: COLORS.ink }}>
            {fullName}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              marginTop: 6,
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: 999,
              backgroundColor: COLORS.accentLight,
            }}
          >
            <Ionicons name="star" size={13} color={COLORS.accent} />
            <Text style={{ marginLeft: 4, fontSize: 12.5, fontWeight: "700", color: COLORS.accentDark }}>
              {hasRating ? rating.toFixed(1) : t("Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1")}
            </Text>
          </View>
        </View>

        <FavoriteHeartButton liked loading={removing} onPress={onRemove} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          paddingVertical: 11,
          borderRadius: 14,
          backgroundColor: COLORS.canvas,
        }}
      >
        <Stat
          icon="briefcase"
          label={t("{{value0}} n\u0103m kinh nghi\u1ec7m", { value0: worker.experience_years, count: worker.experience_years })}
        />
        <View style={{ width: StyleSheet.hairlineWidth, height: 18, backgroundColor: COLORS.line }} />
        <Stat
          icon="check-circle"
          label={t("{{value0}} \u0111\u01a1n", { value0: worker.total_completed_jobs, count: worker.total_completed_jobs })}
        />
      </View>

      {!!worker.bio?.trim() && (
        <Text
          numberOfLines={2}
          style={{ marginTop: 12, paddingHorizontal: 18, fontSize: 13.5, lineHeight: 20, color: COLORS.inkSoft }}
        >
          {worker.bio}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          margin: 16,
          marginTop: 14,
          borderRadius: 999,
          backgroundColor: COLORS.primaryLight,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.primaryDark }}>
          {t("Xem h\u1ed3 s\u01a1")}
        </Text>
        <Feather name="arrow-right" size={16} color={COLORS.primaryDark} style={{ marginLeft: 6 }} />
      </View>
    </TouchableOpacity>
  );
}