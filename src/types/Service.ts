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
    | "TASK_CHECKLIST";
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  min_items?: number;
  min_selections?: number;
  display?: "list" | "grid"; // gợi ý layout cho SINGLE_SELECT không có ảnh
  options?: FieldOption[] | ConditionalOptionGroup[];
  options_by?: string;
  item_fields?: FormField[];
};

export type FormSchema = {
  version: number;
  address_count: number;
  addresses?: { key: string; label: string; required: boolean }[];
  task_checklist?: string;
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
