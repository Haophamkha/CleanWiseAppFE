import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { useAddComplaintAttachmentMutation, useUpdateComplaintWorkflowMutation } from "@/features/complaint/api/complaintApi";
import type {
  ComplaintDetail,
  ComplaintWorkflowRequest,
  RequestedResolution,
} from "@/features/complaint/types/Complaint";
import { useAppTheme } from "@/features/theme/ThemeProvider";
import { formatReviewDate } from "@/features/review/utils/reviewFormat";
import { getApiErrorMessage } from "@/utils/apiError";
import { pickImage } from "@/utils/imagePicker";
import { formatVnd } from "@/utils/currency";

export const requestedResolutions = {
  REDO: "Làm lại miễn phí",
  REFUND: "Hoàn tiền",
  CHANGE: "Đổi lịch hoặc nhân viên",
  SUPPORT: "Nhận hỗ trợ",
} as const satisfies Record<RequestedResolution, string>;

const replyLabels = {
  REVISE: "Trao đổi thêm",
  REPLY: "Gửi thêm thông tin",
  REOPEN: "Yêu cầu xem xét lại",
};
type ReplyAction = keyof typeof replyLabels;

export function ComplaintWorkflow({ complaint }: { complaint: ComplaintDetail }) {
  const { t } = useTranslation();
  const { mode, COLORS } = useAppTheme();
  const [send, { isLoading }] = useUpdateComplaintWorkflowMutation();
  const [upload, { isLoading: isUploading }] = useAddComplaintAttachmentMutation();
  const [reply, setReply] = useState<ReplyAction | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const proposal = complaint.proposal;
  const inReview = complaint.status === "IN_REVIEW";
  const rejected = complaint.status === "REJECTED";
  const awaiting = inReview && proposal?.status === "SENT";
  const requested = complaint.requested_resolution;
  const busy = isLoading || isUploading;
  const events = [...(complaint.events ?? [])].reverse();
  const update = events.find((event) => ["ACK", "REQUEST", "OFFER"].includes(event.kind));
  const terminal = complaint.status === "RESOLVED" || rejected;
  const showProposal = !!proposal && (inReview || (complaint.status === "RESOLVED" && proposal.status === "COMPLETED"));
  const latestSupportMessage = update?.message;
  const title = terminal
    ? rejected ? t("Kết quả xem xét") : t("Khiếu nại đã được giải quyết.")
    : update?.kind === "REQUEST" ? t("Yêu cầu bổ sung thông tin")
    : update?.kind === "ACK" ? t("Phản hồi từ CleanWise")
    : showProposal ? t("Phương án xử lý")
    : t(complaint.status === "CANCELLED" ? "Đã hủy" : complaint.status === "IN_REVIEW" ? "Đang xem xét" : "Đã gửi khiếu nại");
  const result = terminal ? events.find((event) => event.kind === (rejected ? "REJECT" : "CLOSE")) : undefined;
  const resolutionNote = complaint.resolution_note?.trim() || result?.message;
  const body = terminal
    ? resolutionNote?.split("\n").filter((line) => {
        if (proposal?.status !== "COMPLETED") return true;
        if (proposal.refund_transaction_code && line.startsWith("Đã hoàn ") &&
          line.endsWith(`Mã giao dịch ${proposal.refund_transaction_code}.`)) return false;
        return !proposal.voucher_code ||
          line !== `Voucher ${proposal.voucher_code} đã có trong Voucher của tôi. Chọn voucher khi đặt dịch vụ.`;
      }).join("\n").trim()
    : update?.kind === "ACK" || update?.kind === "REQUEST"
      ? latestSupportMessage
      : showProposal ? proposal.message : latestSupportMessage;
  const time = terminal ? complaint.resolved_at ?? result?.created_at : update?.created_at;
  const amount = Number(showProposal ? proposal.refund_amount ?? complaint.refund_amount : complaint.refund_amount);
  const items: { label: string; value: string; icon: keyof typeof Feather.glyphMap }[] = [];
  if (showProposal && proposal.service_action) {
    items.push({
      label: t(requestedResolutions[proposal.service_action]), icon: "calendar",
      value: [
        proposal.scheduled_start && formatReviewDate(proposal.scheduled_start, t),
        proposal.worker_name,
        proposal.fulfillment_booking_code,
      ].filter(Boolean).join(" · ") || "—",
    });
  }
  if (amount > 0) {
    const cash = showProposal && proposal.refund_scope === "CASH";
    const label = cash ? t(terminal ? "Đã đối soát tiền mặt" : "Đối soát tiền mặt")
      : t(terminal ? "Đã hoàn vào ví" : "Hoàn vào Ví CleanWise");
    const transaction = showProposal && proposal.refund_transaction_code;
    items.push({ label, icon: "credit-card", value: [formatVnd(amount, t), transaction].filter(Boolean).join(" · ") });
  }
  if (showProposal && proposal.voucher_code) {
    items.push({
      label: t(terminal ? "Voucher đã cấp" : "Voucher"), icon: "tag",
      value: terminal ? `${proposal.voucher_code} · ${t("Voucher của tôi")}` : proposal.voucher_code,
    });
  }
  if (!terminal && complaint.next_update_at) {
    items.push({ label: t("Hẹn cập nhật"), icon: "clock", value: formatReviewDate(complaint.next_update_at, t) });
  }
  const timeline = [...events, {
    id: "submitted", label: "Đã gửi khiếu nại", created_at: complaint.created_at,
  }];

  async function addPhoto() {
    setError("");
    try {
      const photo = await pickImage({ includeWebFile: true }, t);
      if (photo) await upload({ id: complaint.id, photo }).unwrap();
    } catch (err) {
      setError(getApiErrorMessage(err, t("Không gửi được phản hồi. Vui lòng thử lại."), t));
    }
  }

  async function submit(action: ComplaintWorkflowRequest["action"]) {
    setError("");
    try {
      await send({
        id: complaint.id, action,
        proposal_id: proposal?.id,
        ...(action === "ACCEPT" ? {} : { message: message.trim() }),
      }).unwrap();
      setMessage("");
      setReply(null);
    } catch (err) {
      setError(getApiErrorMessage(err, t("Không gửi được phản hồi. Vui lòng thử lại."), t));
    }
  }

  function startReply(action: ReplyAction) {
    setReply(action);
    setMessage("");
    setError("");
  }

  return (
    <View className="mt-4 gap-3">
      {!!requested && <Text className="text-ink-soft text-sm">{t("Mong muốn xử lý")}{" · "}{t(requestedResolutions[requested])}</Text>}
      <View className="gap-2">
        {(body || terminal || showProposal) && (
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
              <Feather name="headphones" size={17} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ink">CleanWise</Text>
              {!!time && <Text className="text-xs text-ink-soft">{formatReviewDate(time, t)}</Text>}
            </View>
          </View>
        )}
        <View className="gap-3 rounded-2xl rounded-tl-md border border-line bg-canvas p-3.5">
          <Text accessibilityRole="header" className="font-bold text-ink">{title}</Text>
          {!!body && <Text className="text-sm leading-5 text-ink">{body}</Text>}
          {!body && !terminal && !showProposal && (
            <Text className="text-sm leading-5 text-ink-soft">
              {t(complaint.status === "PENDING" ? "Khiếu nại đã gửi, đang chờ CleanWise tiếp nhận."
                : complaint.status === "CANCELLED" ? "Bạn đã hủy khiếu nại này." : "CleanWise đang xem xét khiếu nại của bạn.")}
            </Text>
          )}
          {items.length > 0 && (
            <View className="rounded-xl bg-primary-soft px-3 py-1">
              {items.map(({ label, value, icon }, index) => (
                <View key={label} className={`flex-row items-start gap-2 py-2 ${index ? "border-t border-primary-border" : ""}`}>
                  <View className="pt-0.5"><Feather name={icon} size={15} color={COLORS.primary} /></View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-bold text-primary-dark">{label}</Text>
                    <Text selectable className="text-sm text-ink">{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          {awaiting && !reply && <View className="flex-row flex-wrap gap-2">
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void submit("ACCEPT")} className="rounded-xl bg-primary-fill px-4 py-3">
              <Text className="font-bold text-white">{t("Đồng ý phương án")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => startReply("REVISE")} className="rounded-xl border border-line bg-surface px-4 py-3">
              <Text className="font-bold text-ink">{t(replyLabels.REVISE)}</Text>
            </Pressable>
          </View>}
        </View>
      </View>
      {inReview && complaint.attachments.length < 5 && (
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => void addPhoto()} className="rounded-xl border border-line px-4 py-3">
          <Text className="font-bold text-ink">{t(isUploading ? "Đang gửi ảnh..." : "Thêm ảnh minh chứng")}</Text>
        </Pressable>
      )}
      {(inReview || rejected) && !reply && (
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => startReply(rejected ? "REOPEN" : "REPLY")} className="rounded-xl border border-line px-4 py-3">
          <Text className="font-bold text-ink">{t(replyLabels[rejected ? "REOPEN" : "REPLY"])}</Text>
        </Pressable>
      )}
      {reply && (inReview || rejected) && (
        <View className="gap-2">
          <Text className="font-bold text-ink">{t(replyLabels[reply])}</Text>
          <TextInput
            accessibilityLabel={t("Nội dung phản hồi")}
            className="min-h-20 rounded-xl border border-line bg-canvas p-3 text-ink"
            placeholder={t("Nội dung phản hồi")}
            placeholderTextColor={COLORS.inkMuted}
            keyboardAppearance={mode}
            value={message}
            onChangeText={setMessage}
            maxLength={2000}
            multiline
          />
          <View className="flex-row gap-2">
            <Pressable accessibilityRole="button" disabled={!message.trim() || busy} onPress={() => void submit(reply)}
              className={`rounded-xl bg-primary-fill px-4 py-3 ${!message.trim() || busy ? "opacity-50" : ""}`}>
              <Text className="font-bold text-white">{t("Gửi phản hồi")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => { setReply(null); setError(""); }} className="rounded-xl px-4 py-3">
              <Text className="font-bold text-ink">{t("Hủy")}</Text>
            </Pressable>
          </View>
        </View>
      )}
      {!!error && <Text accessibilityRole="alert" className="text-sm text-danger">{error}</Text>}
      <View className="gap-3 rounded-2xl border border-line bg-surface p-3.5">
        <Text accessibilityRole="header" className="font-bold text-ink">{t("Lịch sử khiếu nại")}</Text>
        <View>
          {timeline.map((event, index) => (
            <View key={event.id} className="flex-row gap-3">
              <View className="w-3 items-center">
                {index < timeline.length - 1 && <View className="absolute bottom-0 top-2 w-px bg-line" />}
                <View className={`mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary ${index === 0 ? "bg-primary-fill" : "bg-surface"}`} />
              </View>
              <View className={`flex-1 gap-0.5 ${index < timeline.length - 1 ? "pb-3" : ""}`}>
                <Text className="text-sm font-semibold text-ink">{t(event.label)}</Text>
                <Text className="text-xs text-ink-soft">{formatReviewDate(event.created_at, t)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
