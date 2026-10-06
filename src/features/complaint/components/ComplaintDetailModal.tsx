import { COLORS } from "@/constants/theme";
import {
  useCancelComplaintMutation,
  useGetComplaintDetailQuery,
} from "@/features/complaint/api/complaintApi";
import { COMPLAINT_STATUS_META } from "@/features/complaint/components/ComplaintCard";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { formatVnd } from "@/utils/currency";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export function ComplaintDetailModal({
  id,
  onClose,
}: {
  id: number | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useGetComplaintDetailQuery(
    id as number,
    {
      skip: id == null,
    },
  );
  const [cancel, { isLoading: cancelling }] = useCancelComplaintMutation();

  const meta = data ? COMPLAINT_STATUS_META[data.status] : undefined;
  const refund = Number(data?.refund_amount) || 0;

  const onCancel = () =>
    Alert.alert("Hủy khiếu nại", "Bạn chắc chắn muốn hủy khiếu nại này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy khiếu nại",
        style: "destructive",
        onPress: async () => {
          try {
            await cancel(id as number).unwrap();
            onClose();
          } catch {
            Alert.alert("Lỗi", "Không hủy được khiếu nại, thử lại sau.");
          }
        },
      },
    ]);

  return (
    <Modal
      visible={id != null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-surface rounded-t-3xl" style={{ maxHeight: "85%" }}>
        <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
          <Text className="text-ink font-extrabold text-lg">
            Chi tiết khiếu nại
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Feather name="x" size={22} color={COLORS.inkSoft} />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : isError || !data ? (
          <Text className="text-ink-soft text-center py-16">
            Không tải được khiếu nại
          </Text>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 text-ink font-bold text-base mr-3">
                {data.issue_type_name}
              </Text>
              {meta && (
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Text
                    className="text-[11.5px] font-bold"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </Text>
                </View>
              )}
            </View>

            <View
              className="flex-row flex-wrap items-center rounded-xl px-3 py-2.5 mt-3"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <Text
                className="text-[11px] font-bold mr-2"
                style={{ color: COLORS.primaryDark, opacity: 0.7 }}
              >
                MÃ ĐƠN
              </Text>
              <Text
                selectable
                className="text-[14px] font-extrabold"
                style={{
                  color: COLORS.primaryDark,
                  fontFamily: Platform.select({
                    ios: "Menlo",
                    default: "monospace",
                  }),
                  letterSpacing: 0.8,
                }}
              >
                {data.booking_code}
              </Text>
              {data.schedule_sequence_no != null && (
                <Text
                  className="text-[12px] font-semibold ml-2"
                  style={{ color: COLORS.primaryDark }}
                >
                  · Buổi {data.schedule_sequence_no}
                </Text>
              )}
            </View>
            <Text className="text-ink-muted text-xs mt-2">
              {data.stage_label}
            </Text>
            <Text className="text-ink-muted text-xs mt-0.5">
              Gửi lúc {formatReviewDate(data.created_at)}
            </Text>

            {!!data.worker_name && (
              <Text className="text-ink-soft text-sm mt-3">
                Nhân viên liên quan: {data.worker_name}
              </Text>
            )}

            {!!data.content && (
              <View className="bg-canvas rounded-2xl p-3.5 mt-4">
                <Text className="text-ink-muted text-xs font-bold mb-1">
                  Nội dung
                </Text>
                <Text className="text-ink text-sm leading-5">
                  {data.content}
                </Text>
              </View>
            )}

            {data.attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
              >
                {data.attachments.map((a) => (
                  <Image
                    key={a.id}
                    source={{ uri: a.file }}
                    className="w-24 h-24 rounded-xl mr-2"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            {(!!data.resolution_note || refund > 0) && (
              <View className="bg-primary-soft border border-primary-border rounded-2xl p-3.5 mt-4">
                <Text className="text-primary-dark text-xs font-bold mb-1">
                  Phản hồi từ CleanWise
                </Text>
                {!!data.resolution_note && (
                  <Text className="text-ink-soft text-sm leading-5">
                    {data.resolution_note}
                  </Text>
                )}
                {refund > 0 && (
                  <Text className="text-success font-bold text-sm mt-2">
                    Đã hoàn {formatVnd(refund)} vào ví
                  </Text>
                )}
                {!!data.resolved_at && (
                  <Text className="text-ink-muted text-xs mt-2">
                    Xử lý lúc {formatReviewDate(data.resolved_at)}
                  </Text>
                )}
              </View>
            )}

            {data.status === "PENDING" && (
              <Pressable
                onPress={onCancel}
                disabled={cancelling}
                className="mt-5 py-3.5 rounded-xl items-center bg-danger-light"
              >
                {cancelling ? (
                  <ActivityIndicator color={COLORS.danger} />
                ) : (
                  <Text className="text-danger font-bold">Hủy khiếu nại</Text>
                )}
              </Pressable>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
