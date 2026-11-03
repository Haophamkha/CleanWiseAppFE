import { translate as defaultTranslate } from "@/features/language/i18n";

import type { FormField } from "@/features/service/types/Service";
import { z } from "zod";

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
function getLocalizedPasswordRule(translateText = defaultTranslate) {
  return z
    .string()
    .min(8, translateText("Mật khẩu tối thiểu 8 ký tự"))
    .regex(/[A-Z]/, translateText("Mật khẩu cần ít nhất 1 chữ hoa"))
    .regex(/[0-9]/, translateText("Mật khẩu cần ít nhất 1 chữ số"));
}

export function getLocalizedLoginSchema(translateText = defaultTranslate) {
  return z.object({
    phone: z
      .string()
      .min(1, translateText("Vui lòng nhập số điện thoại"))
      .regex(phoneRegex, translateText("Số điện thoại không hợp lệ")),
    password: z.string().min(1, translateText("Vui lòng nhập mật khẩu")),
  });
}

export function getLocalizedRegisterSchema(translateText = defaultTranslate) {
  return z
    .object({
      username: z
        .string()
        .min(3, translateText("Tên đăng nhập tối thiểu 3 ký tự"))
        .regex(/^[a-zA-Z0-9_]+$/, translateText("Chỉ dùng chữ, số và dấu gạch dưới")),
      email: z.string().min(1, translateText("Vui lòng nhập email")).email(translateText("Email không hợp lệ")),
      first_name: z.string().min(1, translateText("Vui lòng nhập họ")),
      last_name: z.string().min(1, translateText("Vui lòng nhập tên")),
      phone_number: z.string().regex(phoneRegex, translateText("Số điện thoại không hợp lệ")),
      password: getLocalizedPasswordRule(translateText),
      password_confirm: z.string().min(1, translateText("Vui lòng xác nhận mật khẩu")),
    })
    .refine((data) => data.password === data.password_confirm, {
      message: translateText("Mật khẩu xác nhận không khớp"),
      path: ["password_confirm"],
    });
}

export function getLocalizedForgotPasswordSchema(translateText = defaultTranslate) {
  return z.object({
    email: z.string().min(1, translateText("Vui lòng nhập email")).email(translateText("Email không hợp lệ")),
  });
}

export function getLocalizedResetPasswordSchema(translateText = defaultTranslate) {
  return z
    .object({
      new_password: getLocalizedPasswordRule(translateText),
      new_password_confirm: z.string().min(1, translateText("Vui lòng xác nhận mật khẩu mới")),
    })
    .refine((data) => data.new_password === data.new_password_confirm, {
      message: translateText("Mật khẩu xác nhận không khớp"),
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
