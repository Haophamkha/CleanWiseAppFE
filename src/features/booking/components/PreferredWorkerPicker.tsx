import { COLORS, SHADOWS } from "@/constants/theme";
import type { FavoriteWorker } from "@/features/favorite-worker/types/FavoriteWorker";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Props = {
  workers: FavoriteWorker[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
};

const fullName = (w: FavoriteWorker) =>
  `${w.last_name ?? ""} ${w.first_name ?? ""}`.trim() || "Nhân viên";

export function PreferredWorkerPicker({
  workers,
  selectedId,
  onSelect,
}: Props) {
  const selected = workers.find((w) => w.worker_id === selectedId);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, paddingRight: 8 }}
      >
        {workers.map((w) => {
          const isSelected = w.worker_id === selectedId;
          const rating = Number(w.average_rating);
          return (
            <TouchableOpacity
              key={w.worker_id}
              activeOpacity={0.85}
              onPress={() => onSelect(isSelected ? null : w.worker_id)}
              className={`w-32 mr-3 rounded-2xl border p-3 items-center ${
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-line bg-surface"
              }`}
              style={SHADOWS.card}
            >
              {isSelected && (
                <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary items-center justify-center z-10">
                  <Feather name="check" size={12} color={COLORS.white} />
                </View>
              )}

              {w.avatar ? (
                <Image
                  source={{ uri: w.avatar }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-primary-light items-center justify-center">
                  <Text className="text-primary-dark font-bold text-lg">
                    {(w.first_name ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <Text
                className="text-ink font-semibold text-[13px] mt-2"
                numberOfLines={1}
              >
                {fullName(w)}
              </Text>

              <View className="flex-row items-center mt-1">
                <Feather name="star" size={11} color="#F59E0B" />
                <Text className="text-ink-muted text-[11px] ml-1">
                  {Number.isFinite(rating) && rating > 0
                    ? rating.toFixed(1)
                    : "Mới"}
                  {" · "}
                  {w.total_completed_jobs ?? 0} đơn
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text className="text-ink-muted text-xs mt-2">
        {selected
          ? `Yêu cầu sẽ gửi riêng cho ${fullName(selected)}. Sau 1 giờ nếu chưa nhận hoặc bị từ chối, đơn sẽ mở cho tất cả nhân viên. Chạm lại để bỏ chọn.`
          : "Chọn một nhân viên yêu thích để gửi yêu cầu riêng, hoặc bỏ qua để hệ thống tìm giúp bạn."}
      </Text>
    </View>
  );
}
