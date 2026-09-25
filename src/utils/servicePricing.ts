// src/utils/servicePricing.ts
import type { FieldOption, FormField, PricingConfig } from "@/types/Service";

const isFlatOptions = (
  options: FormField["options"],
): options is FieldOption[] => !!options && !("when" in (options[0] ?? {}));

// Sửa lại hàm kiểm tra và bóc tách options để hỗ trợ cả trường hợp lồng nhau (options_by / when)
const getAllOptionValues = (options: FormField["options"]): string[] => {
  if (!options) return [];
  const values: string[] = [];

  for (const opt of options) {
    // Nếu là flat option thông thường
    if ("value" in opt) {
      values.push(opt.value);
    }
    // Nếu là dạng lồng nhau theo điều kiện (when / items)
    else if ("items" in opt && Array.isArray(opt.items)) {
      opt.items.forEach((item) => {
        if (item.value) values.push(item.value);
      });
    }
  }
  return values;
};

function findFieldByOptionValues(
  fields: FormField[],
  candidateValues: string[],
  excludeKey?: string,
): FormField | undefined {
  return fields.find((f) => {
    if (f.key === excludeKey) return false;
    const allValues = getAllOptionValues(f.options);
    return allValues.some((val) => candidateValues.includes(val));
  });
}

export function getUnitPriceForItem(
  pricingConfig: PricingConfig | undefined,
  itemFields: FormField[],
  item: Record<string, any>,
): number | null {
  if (!pricingConfig?.unit_prices) return null;
  let node: any = pricingConfig.unit_prices;

  for (const sub of itemFields) {
    if (typeof node !== "object" || node === null) break;
    if (sub.type === "QUANTITY" || sub.type === "BOOLEAN") continue;
    const v = item[sub.key];
    if (v && v in node) {
      node = node[v];
    } else {
      node = null;
      break;
    }
  }
  return typeof node === "number" ? node : null;
}

/**
 * Giá của 1 item trong REPEATABLE_GROUP = đơn giá theo cây unit_prices * số lượng,
 * cộng thêm phụ phí cho mỗi field BOOLEAN đang bật, NẾU pricingConfig có key
 * `${field.key}_price` tương ứng (ví dụ pump_gas -> pump_gas_price).
 * Không có key đó thì field boolean chỉ là tuỳ chọn, không cộng tiền.
 * Trả về null nếu chưa xác định được đơn giá gốc (chưa chọn đủ loại/công suất).
 */
export function getItemTotalPrice(
  pricingConfig: PricingConfig | undefined,
  itemFields: FormField[],
  item: Record<string, any>,
): number | null {
  const unitPrice = getUnitPriceForItem(pricingConfig, itemFields, item);
  if (unitPrice == null) return null;

  const qty = item.quantity ?? 1;
  let total = unitPrice * qty;

  itemFields.forEach((f) => {
    if (f.type !== "BOOLEAN" || !item[f.key]) return;
    const surchargeKey = `${f.key}_price`;
    const surcharge = (pricingConfig as any)?.[surchargeKey];
    if (typeof surcharge === "number") total += surcharge * qty;
  });

  return total;
}

/**
 * Giá dịch vụ 1 LẦN hoặc REPEATABLE_GROUP (KHÔNG dùng cho dịch vụ định kỳ
 * pricing_unit === "PER_SESSION" — dùng calculateRecurringPrice bên dưới,
 * vì cách tính hoàn toàn khác: phải nhân theo số buổi + trừ % giảm gói).
 */
export function calculateEstimatedPrice(
  fields: FormField[],
  pricingConfig: PricingConfig | undefined,
  values: Record<string, any>,
): number | null {
  if (!pricingConfig) return null;

  // ĐỔI: dịch vụ định kỳ tính theo buổi có cách tính riêng, không cộng
  // dồn base_prices như dịch vụ 1 lần được.
  if (pricingConfig.pricing_unit === "PER_SESSION") {
    return (
      calculateRecurringPrice(fields, pricingConfig, values)?.subtotal ?? null
    );
  }

  let total = 0;
  let hasBase = false;

  if (pricingConfig.price_matrix) {
    const priceMatrix = pricingConfig.price_matrix as Record<
      string,
      Record<string, number>
    >;

    const outerField = findFieldByOptionValues(
      fields,
      Object.keys(priceMatrix),
    );
    const outerValue = outerField ? values[outerField.key] : undefined;
    const innerMap = outerValue ? priceMatrix[outerValue] : null;

    if (innerMap) {
      const innerField = findFieldByOptionValues(
        fields,
        Object.keys(innerMap),
        outerField?.key,
      );
      const innerValue = innerField ? values[innerField.key] : undefined;
      if (typeof innerMap[innerValue] === "number") {
        total += innerMap[innerValue];
        hasBase = true;
      }
    }
  } else if (pricingConfig.base_prices) {
    const basePrices = pricingConfig.base_prices as Record<string, number>;
    const field = findFieldByOptionValues(fields, Object.keys(basePrices));
    const value = field ? values[field.key] : undefined;
    if (typeof basePrices[value] === "number") {
      total += basePrices[value];
      hasBase = true;
    }
  }

  Object.keys(pricingConfig)
    .filter((k) => k.endsWith("_surcharge"))
    .forEach((key) => {
      const map = pricingConfig[key] as Record<string, number>;
      const field = findFieldByOptionValues(fields, Object.keys(map));
      const value = field ? values[field.key] : undefined;
      if (typeof map[value] === "number") total += map[value];
    });

  if (pricingConfig.additional_services) {
    const additionalServices = pricingConfig.additional_services;
    const field = fields.find((f) => f.type === "MULTI_SELECT");
    const selected: string[] = field ? (values[field.key] ?? []) : [];
    selected.forEach((v) => {
      const price = additionalServices[v];
      if (typeof price === "number") total += price;
    });
  }

  if (pricingConfig.unit_prices) {
    const groupField = fields.find((f) => f.type === "REPEATABLE_GROUP");
    const items: Record<string, any>[] = groupField
      ? (values[groupField.key] ?? [])
      : [];

    items.forEach((item) => {
      const itemTotal = getItemTotalPrice(
        pricingConfig,
        groupField?.item_fields ?? [],
        item,
      );
      if (itemTotal != null) {
        total += itemTotal;
        hasBase = true;
      }
    });
  }

  return hasBase || total > 0 ? total : null;
}

export function getStartingPrice(pricingConfig?: PricingConfig): number | null {
  const numbers: number[] = [];
  const collect = (node: any) => {
    if (typeof node === "number") numbers.push(node);
    else if (node && typeof node === "object")
      Object.values(node).forEach(collect);
  };
  collect(pricingConfig?.base_prices);
  collect(pricingConfig?.price_matrix);
  collect(pricingConfig?.unit_prices);
  return numbers.length ? Math.min(...numbers) : null;
}

// ============================================================
// DỊCH VỤ ĐỊNH KỲ (pricing_unit === "PER_SESSION")
// ============================================================

const WEEKDAY_KEYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const PACKAGE_WEEKS: Record<string, number> = {
  "1_MONTH": 4,
  "2_MONTHS": 8,
  "3_MONTHS": 12,
  "6_MONTHS": 24,
};

export interface RecurringPriceResult {
  unitPrice: number;
  sessionsCount: number;
  discountPercent: number;
  grossSubtotal: number;
  subtotal: number;
}

/**
 * Tính giá cho dịch vụ định kỳ (pricing_unit === "PER_SESSION"), PHẢI khớp
 * 100% với backend (apps/bookings/booking_service.py::create_booking +
 * get_package_discount_percent), vì đây chỉ là số hiển thị tạm tính trước
 * khi khách bấm đặt — giá thật vẫn do BE tính lại và chốt trong booking.
 *
 * subtotal = unit_price * sessions_count * (1 - discount_percent / 100)
 * sessions_count = số thứ đã chọn/tuần * số tuần của package_duration
 *
 * Trả về null nếu chưa đủ thông tin (chưa chọn duration/weekdays/package).
 */
export function calculateRecurringPrice(
  fields: FormField[],
  pricingConfig: PricingConfig | undefined,
  values: Record<string, any>,
): RecurringPriceResult | null {
  if (
    !pricingConfig?.base_prices ||
    pricingConfig.pricing_unit !== "PER_SESSION"
  ) {
    return null;
  }

  const durationField = findFieldByOptionValues(
    fields,
    Object.keys(pricingConfig.base_prices),
  );
  const durationValue = durationField ? values[durationField.key] : undefined;
  const basePrice = durationValue
    ? (pricingConfig.base_prices as Record<string, number>)[durationValue]
    : undefined;
  if (typeof basePrice !== "number") return null;

  const weekdaysField = fields.find((f) => f.type === "WEEKDAY_MULTI_SELECT");
  const weekdays: string[] = weekdaysField
    ? (values[weekdaysField.key] ?? [])
    : [];
  const validWeekdays = weekdays.filter((d) => WEEKDAY_KEYS.includes(d));
  if (validWeekdays.length === 0) return null;

  const packageField = fields.find((f) => f.key === "package_duration");
  const packageValue = packageField ? values[packageField.key] : undefined;
  const weeks = packageValue ? PACKAGE_WEEKS[packageValue] : undefined;
  if (!weeks) return null;

  let unitPrice = basePrice;
  if (pricingConfig.additional_services) {
    const additionalField = fields.find((f) => f.type === "MULTI_SELECT");
    const selected: string[] = additionalField
      ? (values[additionalField.key] ?? [])
      : [];
    selected.forEach((v) => {
      const price = pricingConfig.additional_services?.[v];
      if (typeof price === "number") unitPrice += price;
    });
  }

  const sessionsCount = validWeekdays.length * weeks;
  const grossSubtotal = unitPrice * sessionsCount;

  let discountPercent = 0;
  const discountMap = pricingConfig.package_discount_percent;
  if (
    discountMap &&
    packageValue &&
    typeof discountMap[packageValue] === "number"
  ) {
    discountPercent = discountMap[packageValue];
  }

  const subtotal = Math.round(grossSubtotal * (1 - discountPercent / 100));

  return { unitPrice, sessionsCount, discountPercent, grossSubtotal, subtotal };
}
