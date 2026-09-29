import { COLORS, SHADOWS } from "@/constants/theme";
import type { FavoriteWorker } from "@/types/FavoriteWorker";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const AVATAR = 64;

function Chip({ icon, label }: { icon: any; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: COLORS.canvas,
      }}
    >
      <Feather name={icon} size={12} color={COLORS.inkSoft} />
      <Text style={{ marginLeft: 4, fontSize: 12, color: COLORS.inkSoft }}>
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
  // Họ đứng trước tên: first_name = "Lò", last_name = "Văn C" -> "Lò Văn C"
  const fullName =
    `${worker.first_name ?? ""} ${worker.last_name ?? ""}`.trim() ||
    "Nhân viên";
  const rating = Number(worker.average_rating ?? 0);
  const hasRating = worker.total_completed_jobs > 0 && rating > 0;

  const openProfile = () => {
    router.push({
      pathname: "/worker/[id]",
      params: {
        id: String(worker.worker_id),
        data: JSON.stringify(worker),
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={openProfile}
      style={[
        {
          padding: 14,
          marginBottom: 12,
          borderRadius: 20,
          backgroundColor: COLORS.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: COLORS.line,
        },
        SHADOWS.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {worker.avatar ? (
          <Image
            source={{ uri: worker.avatar }}
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: AVATAR / 2,
              backgroundColor: COLORS.primarySoft,
            }}
          />
        ) : (
          <View
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: AVATAR / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.primarySoft,
            }}
          >
            <Feather name="user" size={26} color={COLORS.primary} />
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 17, fontWeight: "700", color: COLORS.ink }}
          >
            {fullName}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              marginTop: 5,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: COLORS.accentLight,
            }}
          >
            <Feather name="star" size={12} color={COLORS.accentDark} />
            <Text
              style={{
                marginLeft: 4,
                fontSize: 12,
                fontWeight: "600",
                color: COLORS.accentDark,
              }}
            >
              {hasRating ? rating.toFixed(1) : "Chưa có đánh giá"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          hitSlop={8}
          activeOpacity={0.75}
          disabled={removing}
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.dangerLight,
          }}
        >
          {removing ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Feather name="heart" size={18} color={COLORS.danger} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <Chip
          icon="briefcase"
          label={`${worker.experience_years} năm kinh nghiệm`}
        />
        <Chip
          icon="check-circle"
          label={`${worker.total_completed_jobs} đơn`}
        />
      </View>

      {!!worker.bio?.trim() && (
        <Text
          numberOfLines={2}
          style={{
            marginTop: 10,
            fontSize: 14,
            lineHeight: 20,
            color: COLORS.inkSoft,
          }}
        >
          {worker.bio}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: COLORS.primarySoft,
        }}
      >
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: COLORS.primaryDark }}
        >
          Xem hồ sơ
        </Text>
        <Feather
          name="chevron-right"
          size={16}
          color={COLORS.primaryDark}
          style={{ marginLeft: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
}
