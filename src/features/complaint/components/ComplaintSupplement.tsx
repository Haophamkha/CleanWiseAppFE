import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useUpdateComplaintWorkflowMutation } from "@/features/complaint/api/complaintApi";
import type { ComplaintSupplementStatus, PickedFile } from "@/features/complaint/types/Complaint";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { getApiErrorMessage } from "@/utils/apiError";
import { pickImage } from "@/utils/imagePicker";

export function ComplaintSupplement({ complaintId, supplement, attachmentCount }: {
  complaintId: number;
  supplement: ComplaintSupplementStatus;
  attachmentCount: number;
}) {
  const { t } = useTranslation();
  const { COLORS, mode } = useAppTheme();
  const [send, { isLoading }] = useUpdateComplaintWorkflowMutation();
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [picking, setPicking] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const submitted = supplement.status === "SUBMITTED" || !!submittedAt;
  const pending = supplement.status === "PENDING" && !submitted;
  const busy = picking || isLoading;
  const color = submitted ? COLORS.success : pending ? COLORS.infoDark : COLORS.inkSoft;
  const backgroundColor = submitted ? COLORS.successLight : pending ? COLORS.infoLight : COLORS.canvas;
  const formattedTime = supplement.submitted_at || submittedAt;

  async function addPhoto() {
    setError("");
    setPicking(true);
    try {
      const photo = await pickImage({ includeWebFile: true }, t);
      if (photo) setPhotos((previous) => [...previous, photo]);
    } catch (err) {
      setError(getApiErrorMessage(err, t("Không gửi được phản hồi. Vui lòng thử lại."), t));
    } finally {
      setPicking(false);
    }
  }

  async function submit() {
    setError("");
    try {
      const result = await send({
        id: complaintId, action: "REPLY", request_id: supplement.request_id,
        message: message.trim(), attachments: photos,
      }).unwrap();
      setSubmittedAt(result.supplement?.submitted_at ?? new Date().toISOString());
      setPhotos([]);
      setMessage("");
    } catch (err) {
      setError(getApiErrorMessage(err, t("Không gửi được phản hồi. Vui lòng thử lại."), t));
    }
  }

  return (
    <View className="gap-3 rounded-2xl border border-line p-3.5" style={{ backgroundColor }}>
      <View className="gap-1">
        <Text accessibilityRole="header" className="font-bold text-ink">{t("Yêu cầu bổ sung thông tin")}</Text>
        <View className="flex-row items-center gap-1.5" accessibilityLiveRegion="polite">
          <Feather name={submitted ? "check-circle" : pending ? "clock" : "minus-circle"} size={14} color={color} />
          <Text className="text-xs font-semibold" style={{ color }}>
            {t(submitted ? "Đã bổ sung thông tin" : pending ? "Chờ bổ sung thông tin" : "Yêu cầu đã đóng")}
          </Text>
        </View>
      </View>
      <Text className="text-sm leading-5 text-ink">{supplement.message}</Text>
      {submitted && formattedTime && <Text className="text-xs text-ink-soft">{formatReviewDate(formattedTime, t)}</Text>}
      {pending && (
        <View className="gap-2">
          <TextInput
            accessibilityLabel={t("Nội dung bổ sung")}
            placeholder={t("Nội dung bổ sung")}
            className="min-h-20 rounded-xl border border-line bg-surface p-3 text-ink"
            placeholderTextColor={COLORS.inkMuted}
            keyboardAppearance={mode}
            editable={!busy}
            maxLength={2000}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          {photos.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} className="relative">
                  <Image source={{ uri: photo.uri }} className="size-16 rounded-lg" />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("Xóa ảnh minh chứng")}
                    disabled={busy}
                    hitSlop={6}
                    className="absolute right-0 top-0 rounded-full bg-surface p-1"
                    onPress={() => setPhotos((previous) => previous.filter((_, position) => position !== index))}
                  >
                    <Feather name="x" size={14} color={COLORS.ink} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {attachmentCount + photos.length < 5 && (
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void addPhoto()} className="self-start rounded-xl border border-line bg-surface px-3 py-2.5">
              <Text className="text-sm font-semibold text-ink">{t("Thêm ảnh minh chứng")}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            className="self-start rounded-xl bg-primary-fill px-4 py-3 disabled:opacity-50"
            disabled={busy || (!message.trim() && photos.length === 0)}
            onPress={() => void submit()}
          >
            <Text className="font-bold text-white">{t("Gửi thêm thông tin")}</Text>
          </Pressable>
          {!!error && <Text accessibilityRole="alert" className="text-sm text-danger">{error}</Text>}
        </View>
      )}
    </View>
  );
}
