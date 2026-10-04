export type ComplaintStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED";

export type ComplaintStage = "BEFORE_SERVICE" | "IN_SERVICE" | "AFTER_SERVICE";

export type ComplaintIssueTypeStage =
  | "BEFORE_SERVICE"
  | "IN_SERVICE"
  | "AFTER_SERVICE"
  | "ANY";

export type ComplaintReporterRole = "CUSTOMER" | "WORKER";

/**
 * Loại vấn đề/khiếu nại mà customer có thể chọn.
 *
 * GET:
 * /api/customer/complaint-issue-types/
 */
export type ComplaintIssueType = {
  id: number;
  code: string;
  name: string;
  description: string;
  stage: ComplaintIssueTypeStage;
  stage_label: string;
  // BE lọc sẵn theo role người gọi; field này vẫn trả về để hiển thị
  // nếu cần (ví dụ debug), không cần tự lọc lại ở FE.
  applies_to: ComplaintReporterRole | "ANY";
  is_active: boolean;
};

/**
 * File đính kèm của complaint.
 */
export type ComplaintAttachment = {
  id: number;
  file: string;
  file_type: string;
  created_at: string;
};

/**
 * Request tạo complaint.
 *
 * Lưu ý:
 * - Không gửi stage.
 * - BE tự xác định stage dựa vào trạng thái booking.
 * - Không dùng reason nữa.
 */
export type CreateComplaintRequest = {
  booking: number;
  issue_type: number;
  content?: string;
  attachments?: {
    file: string;
    file_type: string;
  }[];
};

/**
 * Complaint trong danh sách.
 */
export type ComplaintListItem = {
  id: number;
  booking: number;
  schedule: number | null;

  reporter_role: ComplaintReporterRole;

  issue_type: number;
  issue_type_code: string;
  issue_type_name: string;

  stage: ComplaintStage;
  stage_label: string;

  status: ComplaintStatus;
  status_label: string;

  created_at: string;
};

/**
 * Response danh sách complaint.
 */
export type ComplaintListResponse = {
  results: ComplaintListItem[];
  count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
};

/**
 * Chi tiết complaint.
 *
 * ĐỔI: BE đổi field `customer`/`customer_name` thành `reporter`/
 * `reporter_name` (chung cho cả khách lẫn nhân viên), thêm `reporter_role`,
 * `worker`/`worker_name` (nhân viên liên quan tới khiếu nại, có thể null).
 */
export type ComplaintDetail = {
  id: number;

  reporter: number;
  reporter_role: ComplaintReporterRole;
  reporter_name: string;

  worker: number | null;
  worker_name: string | null;

  booking: number;
  schedule: number | null;

  issue_type: number;
  issue_type_code: string;
  issue_type_name: string;

  stage: ComplaintStage;
  stage_label: string;

  content: string;

  status: ComplaintStatus;
  status_label: string;

  resolved_by: number | null;
  resolved_by_name: string | null;

  resolution_note: string | null;
  resolved_at: string | null;
  /** Số tiền đã hoàn vào ví cho khiếu nại này (0 nếu không hoàn) */
  refund_amount: string;

  created_at: string;

  attachments: ComplaintAttachment[];
};

export type CreateComplaintPayload = {
  booking: number;
  schedule: number;
  issue_type: number;
  content?: string;
  files?: PickedFile[];
};

export type PickedFile = {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
};

