import type { ComplaintDetail } from "../types/Complaint";

const progressLabels = {
  SENT: "Chờ bạn phản hồi",
  ACCEPTED: "Đang thực hiện",
  DECLINED: "Đang trao đổi thêm",
} as const;

export function getComplaintProgressLabel(
  status: ComplaintDetail["status"],
  proposalStatus?: NonNullable<ComplaintDetail["proposal"]>["status"] | null,
) {
  if (status !== "IN_REVIEW" || !proposalStatus || proposalStatus === "COMPLETED") return undefined;
  return progressLabels[proposalStatus];
}
