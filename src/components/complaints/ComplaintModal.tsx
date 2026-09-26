import { COLORS } from "@/components/service/formFieldShared";
import {
  useCreateComplaintMutation,
  useGetComplaintDetailQuery,
  useGetComplaintIssueTypesQuery,
  useGetComplaintsQuery,
} from "@/services/complaintApi";
import type { ComplaintStage, PickedFile } from "@/types/Complaint";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ComplaintAttachmentPicker } from "./ComplaintAttachmentPicker";

function getComplaintStage(bookingStatus: string): ComplaintStage | null {
  switch (bookingStatus) {
    case "PENDING":
    case "ASSIGNED":
      return "BEFORE_SERVICE";
    case "IN_PROGRESS":
      return "IN_SERVICE";
    case "COMPLETED":
      return "AFTER_SERVICE";
    default:
      return null;
  }
}

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E", label: "Chờ xử lý" },
  IN_REVIEW: { bg: "#DBEAFE", text: "#1E40AF", label: "Đang xem xét" },
  RESOLVED: { bg: "#D1FAE5", text: "#065F46", label: "Đã xử lý" },
  REJECTED: { bg: "#FEE2E2", text: "#991B1B", label: "Bị từ chối" },
  CANCELLED: { bg: "#F3F4F6", text: "#6B7280", label: "Đã hủy" },
};

export function ComplaintModal({
  visible,
  bookingId,
  scheduleId,
  bookingStatus,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  bookingId: number;
  scheduleId: number;
  bookingStatus: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [issueTypeId, setIssueTypeId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PickedFile[]>([]);
  const [error, setError] = useState("");

  const complaintStage = useMemo(
    () => getComplaintStage(bookingStatus),
    [bookingStatus],
  );

  // Kiểm tra buổi này đã có khiếu nại chưa
  const { data: existingList, isLoading: isCheckingExisting } =
    useGetComplaintsQuery({ schedule: scheduleId }, { skip: !visible });

  const existingId = existingList?.results?.[0]?.id;

  const { data: existingComplaint, isLoading: isLoadingExisting } =
    useGetComplaintDetailQuery(existingId as number, {
      skip: !existingId,
    });

  const hasExisting = !!existingId;

  const {
    data: issueTypes = [],
    isLoading: isLoadingIssueTypes,
    isError: isIssueTypeError,
  } = useGetComplaintIssueTypesQuery(
    complaintStage ? { stage: complaintStage } : undefined,
    { skip: !visible || !complaintStage || hasExisting },
  );

  const [createComplaint, { isLoading }] = useCreateComplaintMutation();

  const resetAndClose = () => {
    setIssueTypeId(null);
    setContent("");
    setImages([]);
    setError("");
    onClose();
  };

  useEffect(() => {
    if (!visible) {
      setIssueTypeId(null);
      setContent("");
      setImages([]);
      setError("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!complaintStage) {
      const message =
        "Trạng thái đơn hàng hiện tại không cho phép gửi khiếu nại.";
      setError(message);
      showErrorToast("Không thể gửi phản hồi", message);
      return;
    }
    if (!issueTypeId) {
      setError("Vui lòng chọn lý do phản hồi");
      return;
    }
    if (!content.trim()) {
      setError("Vui lòng mô tả chi tiết vấn đề gặp phải");
      return;
    }

    setError("");

    try {
      await createComplaint({
        booking: bookingId,
        schedule: scheduleId,
        issue_type: issueTypeId,
        content: content.trim(),
        files: images,
      }).unwrap();

      showSuccessToast(
        "Đã gửi phản hồi",
        "Chúng tôi sẽ xem xét và phản hồi bạn sớm nhất",
      );
      resetAndClose();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.data?.issue_type?.[0] ||
        err?.data?.schedule?.[0] ||
        err?.data?.booking?.[0] ||
        err?.data?.content?.[0] ||
        err?.data?.attachments?.[0] ||
        err?.data?.message ||
        err?.data?.detail ||
        "Gửi phản hồi thất bại, vui lòng thử lại";

      setError(String(message));
      showErrorToast("Không thể gửi phản hồi", String(message));
    }
  };

  const renderExisting = () => {
    if (isLoadingExisting) {
      return (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      );
    }

    if (!existingComplaint) return null;

    const badge =
      STATUS_BADGE[existingComplaint.status] ?? STATUS_BADGE.PENDING;

    return (
      <View>
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full self-start mb-3"
          style={{ backgroundColor: badge.bg }}
        >
          <Text className="text-[12px] font-bold" style={{ color: badge.text }}>
            {badge.label}
          </Text>
        </View>

        <Text
          className="text-[13px] font-bold uppercase mb-1"
          style={{ color: COLORS.textMuted }}
        >
          Lý do
        </Text>
        <Text
          className="text-[15px] font-medium mb-3"
          style={{ color: COLORS.text }}
        >
          {existingComplaint.issue_type_name}
        </Text>

        <Text
          className="text-[13px] font-bold uppercase mb-1"
          style={{ color: COLORS.textMuted }}
        >
          Mô tả
        </Text>
        <Text className="text-[14px] mb-3" style={{ color: COLORS.text }}>
          {existingComplaint.content || "—"}
        </Text>

        {existingComplaint.attachments.length > 0 && (
          <>
            <Text
              className="text-[13px] font-bold uppercase mb-2"
              style={{ color: COLORS.textMuted }}
            >
              Ảnh minh chứng
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row mb-3" style={{ gap: 10 }}>
                {existingComplaint.attachments.map((att) => (
                  <Image
                    key={att.id}
                    source={{ uri: att.file }}
                    style={{ width: 84, height: 84, borderRadius: 16 }}
                  />
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {existingComplaint.resolution_note && (
          <>
            <Text
              className="text-[13px] font-bold uppercase mb-1"
              style={{ color: COLORS.textMuted }}
            >
              Phản hồi từ chúng tôi
            </Text>
            <Text className="text-[14px] mb-3" style={{ color: COLORS.text }}>
              {existingComplaint.resolution_note}
            </Text>
          </>
        )}

        <View
          className="rounded-xl px-4 py-3 mt-2"
          style={{
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text className="text-[13px]" style={{ color: COLORS.textMuted }}>
            Buổi làm việc này đã được gửi khiếu nại, không thể chỉnh sửa.
          </Text>
        </View>
      </View>
    );
  };

  const renderForm = () => {
    if (isLoadingIssueTypes) {
      return (
        <View className="items-center justify-center py-6">
          <ActivityIndicator color={COLORS.primary} />
          <Text className="text-[13px] text-gray-400 mt-2">
            Đang tải danh sách lý do...
          </Text>
        </View>
      );
    }

    if (isIssueTypeError) {
      return (
        <View
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
          }}
        >
          <Text className="text-[13px]" style={{ color: COLORS.danger }}>
            Không tải được danh sách lý do phản hồi.
          </Text>
        </View>
      );
    }

    if (issueTypes.length === 0) {
      return (
        <View
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text className="text-[13px] text-gray-500">
            Hiện chưa có lý do phản hồi phù hợp với trạng thái đơn hàng.
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Text
          className="text-[13px] font-bold uppercase mb-2"
          style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
        >
          Lý do
        </Text>

        {issueTypes.map((item) => {
          const selected = issueTypeId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setIssueTypeId(item.id);
                setError("");
              }}
              activeOpacity={0.85}
              className="rounded-2xl px-4 py-3.5 mb-2.5 flex-row items-center"
              style={{
                backgroundColor: selected ? "#FEF2F2" : "#FFFFFF",
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? COLORS.danger : "#E5E7EB",
                shadowColor: selected ? COLORS.danger : "transparent",
                shadowOpacity: selected ? 0.15 : 0,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: selected ? 2 : 0,
              }}
            >
              <View
                className="w-5 h-5 rounded-full items-center justify-center mr-3"
                style={{
                  borderWidth: 2,
                  borderColor: selected ? COLORS.danger : "#D1D5DB",
                  backgroundColor: selected ? COLORS.danger : "transparent",
                }}
              >
                {selected && <Feather name="check" size={12} color="#fff" />}
              </View>

              <View className="flex-1">
                <Text
                  className="text-[14.5px] font-bold"
                  style={{ color: selected ? COLORS.danger : COLORS.text }}
                >
                  {item.name}
                </Text>
                {!!item.description && (
                  <Text
                    className="text-[12px] mt-0.5"
                    style={{ color: COLORS.textMuted }}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text
          className="text-[13px] font-bold uppercase mb-2 mt-3"
          style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
        >
          Mô tả chi tiết
        </Text>

        <TextInput
          className="rounded-xl px-4 py-3 text-[15px]"
          style={{
            backgroundColor: COLORS.background,
            borderWidth: 1,
            borderColor: COLORS.border,
            color: COLORS.text,
            minHeight: 110,
            textAlignVertical: "top",
          }}
          placeholder="Mô tả cụ thể vấn đề bạn gặp phải..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={content}
          onChangeText={(value) => {
            setContent(value);
            if (error) setError("");
          }}
          maxLength={1000}
        />
        <Text className="text-[11px] text-gray-400 text-right mt-1">
          {content.length}/1000
        </Text>

        <Text
          className="text-[13px] font-bold uppercase mb-2 mt-4"
          style={{ color: COLORS.textMuted, letterSpacing: 0.5 }}
        >
          Ảnh minh chứng (không bắt buộc)
        </Text>
        <ComplaintAttachmentPicker
          images={images}
          onChange={setImages}
          disabled={isLoading}
        />

        {!!error && (
          <Text className="text-[13px] mt-3" style={{ color: COLORS.danger }}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || isLoadingIssueTypes || issueTypes.length === 0}
          activeOpacity={0.85}
          className="rounded-2xl py-4 items-center mt-5 mb-3"
          style={{
            backgroundColor: COLORS.danger,
            opacity:
              isLoading || isLoadingIssueTypes || issueTypes.length === 0
                ? 0.7
                : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-[15px]">
              Gửi phản hồi
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(17, 24, 39, 0.55)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={resetAndClose}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        <View
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "88%",
            backgroundColor: COLORS.white,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* HEADER */}
          <View
            className="flex-row items-center justify-between px-5 py-4"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: "#FEE2E2",
                }}
              >
                <Feather name="alert-circle" size={19} color="#B91C1C" />
              </View>

              <View className="flex-1">
                <Text
                  className="text-[17px] font-bold"
                  style={{
                    color: COLORS.text,
                  }}
                >
                  {hasExisting ? "Khiếu nại đã gửi" : "Gửi phản hồi"}
                </Text>

                <Text
                  className="text-[12px] mt-0.5"
                  style={{
                    color: COLORS.textMuted,
                  }}
                >
                  {hasExisting
                    ? "Thông tin khiếu nại của bạn"
                    : "Hãy mô tả vấn đề bạn gặp phải"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={resetAndClose}
              hitSlop={10}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#F3F4F6",
              }}
            >
              <Feather name="x" size={19} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {isCheckingExisting ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator color={COLORS.primary} />

                <Text
                  className="text-[13px] mt-3"
                  style={{
                    color: COLORS.textMuted,
                  }}
                >
                  Đang kiểm tra khiếu nại...
                </Text>
              </View>
            ) : hasExisting ? (
              renderExisting()
            ) : (
              renderForm()
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
