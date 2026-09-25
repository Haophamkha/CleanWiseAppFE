export type FieldOption = {
  value: string;
  label: string;
  description?: string;
  image?: string;
};

export type ConditionalOptionGroup = {
  when: Record<string, string>;
  items: FieldOption[];
};

export type FormField = {
  key: string;
  type:
    | "SINGLE_SELECT"
    | "MULTI_SELECT"
    | "WEEKDAY_MULTI_SELECT"
    | "QUANTITY"
    | "TEXT"
    | "TEXTAREA"
    | "REPEATABLE_GROUP"
    | "BOOLEAN"
    | "TIME"
    | "DATE"
    | "TASK_CHECKLIST";
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  min_items?: number;
  min_selections?: number;
  min_days_from_now?: number;
  display?: "list" | "grid";
  options?: FieldOption[] | ConditionalOptionGroup[];
  options_by?: string;
  item_fields?: FormField[];
};

export type FormSchema = {
  version: number;
  address_count: number;
  schedule_type?: "ONCE" | "RECURRING_WEEKLY";
  addresses?: { key: string; label: string; required: boolean }[];
  task_checklist?: string;
  // ĐỔI: "ONCE" (mặc định) hoặc "RECURRING_WEEKLY" — quyết định
  // schedule_builder.py bên BE build lịch kiểu gì.
  schedule_type?: "ONCE" | "RECURRING_WEEKLY";
  fields: FormField[];
};

/**
 * Cây giá: node lá là number, node nhánh là object lồng nhau.
 * Dùng cho unit_prices (nhiều cấp) và price_matrix (2 cấp).
 */
export type PriceNode = number | { [key: string]: PriceNode };

export type PricingConfig = {
  base_prices?: Record<string, number>;
  price_matrix?: Record<string, Record<string, number>>;
  unit_prices?: Record<string, PriceNode>;
  additional_services?: Record<string, number>;
  /**
   * ĐỔI: "PER_SESSION" nghĩa là base_prices là giá của MỘT buổi (dịch
   * vụ định kỳ dọn nhà) — cần nhân với số buổi (weekdays.length *
   * PACKAGE_WEEKS[package_duration]) mới ra subtotal. Không có field
   * này (hoặc giá trị khác) thì base_prices/price_matrix là giá trọn
   * gói như trước.
   */
  pricing_unit?: "PER_SESSION";
  /**
   * ĐỔI: % giảm giá theo thời hạn gói, key khớp với option value của
   * field package_duration (vd "2_MONTHS": 5 nghĩa là giảm 5%). Chỉ
   * áp dụng khi pricing_unit === "PER_SESSION". Không có field này
   * hoặc thiếu key -> coi như 0%.
   */
  package_discount_percent?: Record<string, number>;
  /** Các key dạng `*_surcharge`, ví dụ `area_surcharge`, `time_surcharge`. */
  [key: string]: unknown;
};

export type ServiceListItem = {
  id: number;
  code: string;
  section_code: string;
  name: string;
  description: string;
  is_active: boolean;
  primary_image: string | null;
};

export type ServiceDetail = ServiceListItem & {
  form_schema: FormSchema;
  pricing_config: PricingConfig;
  images: { id: number; image: string }[];
  created_at: string;
  updated_at: string;
};
