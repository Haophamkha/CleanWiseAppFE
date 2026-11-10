import { translate as defaultTranslate } from "@/features/language/i18n";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";
import { RADIUS } from "@/constants/theme";
import type { BookingFavoriteWorker } from "@/features/booking/types/Booking";
import type { FavoriteWorker } from "@/features/favorite-worker/types/FavoriteWorker";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const workerName = (worker: FavoriteWorker, translateText = defaultTranslate) => {
  return (
    [worker.last_name, worker.first_name].filter(Boolean).join(" ").trim() ||
    translateText("Nhân viên")
  );
};

/* ---------- Modal giải thích (dấu ?) ---------- */
export function PreferredWorkerInfoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { COLORS, OVERLAY } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        accessible={false}
        style={{
          flex: 1,
          backgroundColor: OVERLAY,
          justifyContent: "center",
          padding: 28,
        }}
      >
        <Pressable
          className="bg-surface items-center"
          style={{ borderRadius: RADIUS.card + 8, padding: 24 }}
        >
          <View
            className="items-center justify-center mb-3"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: COLORS.accentLight,
            }}
          >
            <Feather name="help-circle" size={28} color={COLORS.accent} />
          </View>
          <Text className="font-bold text-base text-ink text-center">
            {t("Chọn 1 nhân viên yêu thích để gửi yêu cầu riêng")}</Text>
          <Text className="text-ink-soft text-[13px] text-center mt-3 leading-5">
            {t("Đơn của bạn sẽ được ưu tiên gửi riêng cho nhân viên bạn chọn trong khoảng 1 giờ (hoặc đến trước giờ làm 30 phút nếu gần giờ hơn). Nếu nhân viên không nhận hoặc từ chối, đơn sẽ tự động mở cho tất cả nhân viên phù hợp.")}</Text>
          <Text className="text-ink-muted text-xs text-center mt-3">
            {t("Bước này không bắt buộc. Danh sách chỉ gồm nhân viên phù hợp với dịch vụ và khu vực của bạn.")}</Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="bg-primary-fill rounded-2xl items-center justify-center mt-5 self-stretch"
            style={{ height: 46 }}
          >
            <Text className="text-white font-bold">{t("Đã hiểu")}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- Modal chọn nhân viên ---------- */
type Props = {
  visible: boolean;
  workers: BookingFavoriteWorker[];
  selectedId?: number;
  schedule?: string;
  isChecking: boolean;
  hasError: boolean;
  onRetry: () => void;
  onSelect: (worker: BookingFavoriteWorker | null) => void;
  onClose: () => void;
};

export function PreferredWorkerSheet({
  visible,
  workers,
  selectedId,
  schedule,
  isChecking,
  hasError,
  onRetry,
  onSelect,
  onClose,
}: Props) {
  const { t } = useTranslation();

  const { COLORS, OVERLAY } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: OVERLAY,
          justifyContent: "center",
          padding: 20,
        }}
        accessible={false}
      >
        <Pressable
          accessibilityViewIsModal
          accessible={false}
          className="bg-surface"
          style={{
            borderRadius: RADIUS.card + 8,
            maxHeight: "80%",
            overflow: "hidden",
          }}
        >
          <View className="flex-row items-center px-5 pt-5 pb-3">
            <View className="flex-1 pr-3">
              <Text className="font-bold text-lg text-ink">
                {t("Nhân viên yêu thích")}</Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                {t("Chọn 1 nhân viên để gửi yêu cầu riêng")}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t("Đóng")}
            >
              <Feather name="x" size={22} color={COLORS.inkMuted} />
            </TouchableOpacity>
          </View>

          {schedule && (
            <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-primary-soft px-3 py-2.5">
              <Feather name="clock" size={16} color={COLORS.primaryDark} />
              <Text className="flex-1 text-[13px] font-semibold text-primary-dark">{schedule}</Text>
            </View>
          )}
          {isChecking ? (
            <View className="items-center gap-2 px-4 pb-5 pt-2" accessibilityLiveRegion="polite">
              <ActivityIndicator color={COLORS.primary} />
              <Text className="text-center text-sm text-ink-soft">
                {t("Đang kiểm tra lịch nhân viên…")}
              </Text>
            </View>
          ) : hasError ? (
            <View className="items-center px-4 pb-5 pt-2" accessibilityLiveRegion="polite">
              <Text className="text-center text-sm text-ink-soft">
                {t("Không thể kiểm tra lịch nhân viên.")}
              </Text>
              <TouchableOpacity accessibilityRole="button" className="px-4 py-3" onPress={onRetry}>
                <Text className="font-semibold text-primary-dark">{t("Thử lại")}</Text>
              </TouchableOpacity>
            </View>
          ) : workers.length === 0 ? (
            <Text className="px-4 pb-5 text-center text-sm text-ink-soft">
              {t("Chưa có nhân viên yêu thích phù hợp")}
            </Text>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            >
              {workers.map((worker) => {
                const available = worker.availability === "AVAILABLE";
                const selected = available && worker.worker_id === selectedId;
                const name = workerName(worker, t);
                const rating = Number(worker.average_rating);
                const status = available
                  ? t("Rảnh")
                  : worker.availability === "BUSY" ? t("Bận") : t("Không thể nhận việc");
                const statusColor = available ? COLORS.primaryDark : COLORS.inkSoft;

                return (
                  <TouchableOpacity
                    key={worker.worker_id}
                    activeOpacity={0.8}
                    disabled={!available}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !available, selected }}
                    accessibilityLabel={`${name}, ${status}`}
                    onPress={
                      available
                        ? () => {
                            onSelect(selected ? null : worker);
                            onClose();
                          }
                        : undefined
                    }
                    className="flex-row items-center rounded-2xl border mb-2.5"
                    style={{
                      padding: 12,
                      borderColor: selected ? COLORS.primary : COLORS.line,
                      backgroundColor: selected
                        ? COLORS.primarySoft
                        : available ? COLORS.surface : COLORS.surfaceMuted,
                    }}
                  >
                    {worker.avatar ? (
                      <Image
                        source={{ uri: worker.avatar }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                    ) : (
                      <View
                        className="items-center justify-center"
                        style={{
                          width: 44, height: 44, borderRadius: 22,
                          backgroundColor: available ? COLORS.primaryLight : COLORS.line,
                        }}
                      >
                        <Text className="font-bold text-lg" style={{ color: statusColor }}>
                          {name.trim().charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View className="flex-1 mx-2">
                      <Text
                        className={`font-bold text-[15px] ${available ? "text-ink" : "text-ink-soft"}`}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>
                      <View className="flex-row flex-wrap items-center mt-1">
                        <Feather name="star" size={12} color={COLORS.accent} />
                        <Text className="text-xs font-semibold text-ink ml-1">
                          {rating > 0 ? rating.toFixed(1) : t("Mới")}
                        </Text>
                        <Text className="text-xs text-ink-soft ml-2">
                          {worker.total_completed_jobs} {t("đơn")}</Text>
                      </View>
                      {worker.experience_years != null && (
                        <Text className="text-xs text-ink-soft mt-0.5">
                          {worker.experience_years} {t("năm kinh nghiệm")}</Text>
                      )}
                    </View>

                    <View
                      className="flex-row items-center gap-1 rounded-full px-2 py-1"
                      style={{ backgroundColor: available ? COLORS.successLight : COLORS.line, maxWidth: 108 }}
                    >
                      <Feather name={available ? "check" : "minus"} size={12} color={statusColor} />
                      <Text className="shrink text-xs font-semibold" style={{ color: statusColor }}>
                        {status}
                      </Text>
                    </View>

                    <View
                      className="ml-2 items-center justify-center"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? COLORS.primary : COLORS.line,
                        opacity: available ? 1 : 0,
                        backgroundColor: selected
                          ? COLORS.primaryFill
                          : "transparent",
                      }}
                    >
                      {selected && (
                        <Feather name="check" size={14} color={COLORS.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
