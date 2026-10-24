import { translate as t } from "@/features/language/i18n";
import type { FormField } from "@/features/service/types/Service";
import { z } from "zod";

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
function getLocalizedPasswordRule() {
  return z
    .string()
    .min(8, t("Mật khẩu tối thiểu 8 ký tự"))
    .regex(/[A-Z]/, t("Mật khẩu cần ít nhất 1 chữ hoa"))
    .regex(/[0-9]/, t("Mật khẩu cần ít nhất 1 chữ số"));
}

export function getLocalizedLoginSchema() {
  return z.object({
    phone: z
      .string()
      .min(1, t("Vui lòng nhập số điện thoại"))
      .regex(phoneRegex, t("Số điện thoại không hợp lệ")),
    password: z.string().min(1, t("Vui lòng nhập mật khẩu")),
  });
}

export function getLocalizedRegisterSchema() {
  return z
    .object({
      username: z
        .string()
        .min(3, t("Tên đăng nhập tối thiểu 3 ký tự"))
        .regex(/^[a-zA-Z0-9_]+$/, t("Chỉ dùng chữ, số và dấu gạch dưới")),
      email: z.string().min(1, t("Vui lòng nhập email")).email(t("Email không hợp lệ")),
      first_name: z.string().min(1, t("Vui lòng nhập họ")),
      last_name: z.string().min(1, t("Vui lòng nhập tên")),
      phone_number: z.string().regex(phoneRegex, t("Số điện thoại không hợp lệ")),
      password: getLocalizedPasswordRule(),
      password_confirm: z.string().min(1, t("Vui lòng xác nhận mật khẩu")),
    })
    .refine((data) => data.password === data.password_confirm, {
      message: t("Mật khẩu xác nhận không khớp"),
      path: ["password_confirm"],
    });
}

export function getLocalizedForgotPasswordSchema() {
  return z.object({
    email: z.string().min(1, t("Vui lòng nhập email")).email(t("Email không hợp lệ")),
  });
}

export function getLocalizedResetPasswordSchema() {
  return z
    .object({
      new_password: getLocalizedPasswordRule(),
      new_password_confirm: z.string().min(1, t("Vui lòng xác nhận mật khẩu mới")),
    })
    .refine((data) => data.new_password === data.new_password_confirm, {
      message: t("Mật khẩu xác nhận không khớp"),
      path: ["new_password_confirm"],
    });
}

type AddressEntry = { key: string; label: string; required?: boolean };

const isEmptyValue = (value: any) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

export function getMissingRequiredFieldLabels(
  fields: FormField[],
  values: Record<string, any>,
  addressEntries: AddressEntry[] = [],
): string[] {
  const missing: string[] = [];

  addressEntries.forEach((entry) => {
    if (entry.required && isEmptyValue(values[entry.key])) {
      missing.push(entry.label);
    }
  });

  fields.forEach((field) => {
    if (!field.required) return;
    if (
      field.type === "TEXTAREA" ||
      field.type === "TASK_CHECKLIST" ||
      field.type === "REPEATABLE_GROUP"
    ) {
      return;
    }
    if (isEmptyValue(values[field.key])) {
      missing.push(field.label);
    }
  });

  return missing;
}
