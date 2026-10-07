import { COLORS, RADIUS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AMBER = "#F59E0B";

export const workerKey = (w: any) => (w?.worker ?? w)?.worker_id ?? w?.id;

export const workerName = (w: any) => {
  const x = w?.worker ?? w;
  return (
    [x?.last_name, x?.first_name].filter(Boolean).join(" ").trim() ||
    x?.full_name ||
    x?.name ||
    "Nhân viên"
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
          backgroundColor: "rgba(0,0,0,0.5)",
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
              backgroundColor: "#FEF3C7",
            }}
          >
            <Feather name="help-circle" size={28} color={AMBER} />
          </View>
          <Text className="font-bold text-base text-ink text-center">
            Chọn 1 nhân viên yêu thích để gửi yêu cầu riêng
          </Text>
          <Text className="text-ink-soft text-[13px] text-center mt-3 leading-5">
            Đơn của bạn sẽ được ưu tiên gửi riêng cho nhân viên bạn chọn trong
            khoảng 1 giờ (hoặc đến trước giờ làm 30 phút nếu gần giờ hơn). Nếu
            nhân viên không nhận hoặc từ chối, đơn sẽ tự động mở cho tất cả nhân
            viên phù hợp.
          </Text>
          <Text className="text-ink-muted text-xs text-center mt-3">
            Bước này không bắt buộc. Danh sách chỉ gồm nhân viên phù hợp với
            dịch vụ và khu vực của bạn.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl items-center justify-center mt-5 self-stretch"
            style={{ height: 46 }}
          >
            <Text className="text-white font-bold">Đã hiểu</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- Modal chọn nhân viên ---------- */
type Props = {
  visible: boolean;
  workers: any[];
  selectedId: number | null | undefined;
  onSelect: (id: any) => void;
  onClose: () => void;
};

export function PreferredWorkerSheet({
  visible,
  workers,
  selectedId,
  onSelect,
  onClose,
}: Props) {
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
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Pressable
          className="bg-surface"
          style={{
            borderRadius: RADIUS.card + 8,
            maxHeight: "80%",
            minHeight: "45%",
            overflow: "hidden",
          }}
        >
          <View className="flex-row items-center px-5 pt-5 pb-3">
            <View className="flex-1 pr-3">
              <Text className="font-bold text-lg text-ink">
                Nhân viên yêu thích
              </Text>
              <Text className="text-ink-muted text-xs mt-0.5">
                Chọn 1 nhân viên để gửi yêu cầu riêng
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={COLORS.inkMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          >
            {workers.map((w) => {
              const x = w?.worker ?? w;
              const id = workerKey(w);
              const selected = id === selectedId;
              const name = workerName(w);
              const rating = Number(x?.average_rating ?? 0);

              return (
                <TouchableOpacity
                  key={id}
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelect(selected ? null : id);
                    onClose();
                  }}
                  className="flex-row items-center rounded-2xl border mb-2.5"
                  style={{
                    padding: 12,
                    borderColor: selected ? COLORS.primary : COLORS.line,
                    backgroundColor: selected
                      ? COLORS.primarySoft
                      : COLORS.surface,
                  }}
                >
                  {x?.avatar ? (
                    <Image
                      source={{ uri: x.avatar }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                    />
                  ) : (
                    <View
                      className="bg-primary-light items-center justify-center"
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                    >
                      <Text className="font-bold text-lg text-primary-dark">
                        {name.trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View className="flex-1 ml-3">
                    <Text
                      className="font-bold text-[15px] text-ink"
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Feather name="star" size={12} color={AMBER} />
                      <Text className="text-xs font-semibold text-ink ml-1">
                        {rating > 0 ? rating.toFixed(1) : "Mới"}
                      </Text>
                      <Text className="text-xs text-ink-muted ml-2">
                        {x?.total_completed_jobs ?? 0} đơn
                      </Text>
                    </View>
                    {x?.experience_years != null && (
                      <Text className="text-xs text-ink-muted mt-0.5">
                        {x.experience_years} năm kinh nghiệm
                      </Text>
                    )}
                  </View>

                  <View
                    className="items-center justify-center"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? COLORS.primary : COLORS.line,
                      backgroundColor: selected
                        ? COLORS.primary
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
