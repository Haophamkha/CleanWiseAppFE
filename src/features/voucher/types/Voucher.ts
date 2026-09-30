export type VoucherDistributionType = "PUBLIC" | "CODE_ONLY" | "ASSIGNED";
export type VoucherDiscountType = "PERCENT" | "FIXED";
export type VoucherLifecycleStatus =
  | "ACTIVE"
  | "UPCOMING"
  | "EXPIRED"
  | "EXHAUSTED"
  | "DISABLED";

export type Voucher = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  distribution_type: VoucherDistributionType;
  discount_type: VoucherDiscountType;
  discount_value: string;
  max_discount_amount?: string | null;
  min_order_amount: string;
  remaining_issuance?: number | null;
  start_at: string;
  end_at: string;
  lifecycle_status: VoucherLifecycleStatus;
};

export type UserVoucherStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "USED"
  | "REVOKED";

export type UserVoucherSource = "ADMIN" | "CODE" | "PUBLIC" | "CAMPAIGN";

export type UserVoucher = {
  id: number;
  voucher: Voucher;
  source: UserVoucherSource;
  status: UserVoucherStatus;
  is_usable: boolean;
  created_at: string;
};

export type ValidateVoucherRequest = {
  code: string;
  subtotal_amount: string | number;
};

export type ValidateVoucherResponse = {
  voucher: Voucher;
  subtotal_amount: string;
  discount_amount: string;
  total_amount: string;
};
