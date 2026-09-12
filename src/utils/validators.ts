import { z } from "zod";

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(phoneRegex, "Số điện thoại không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ dùng chữ, số và dấu gạch dưới"),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    first_name: z.string().min(1, "Vui lòng nhập họ"),
    last_name: z.string().min(1, "Vui lòng nhập tên"),
    phone_number: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Mật khẩu cần ít nhất 1 chữ số"),
    password_confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["password_confirm"],
  });

export const forgotPasswordSchema = z.object({
  contact: z.string().min(1, "Vui lòng nhập số điện thoại hoặc email"),
});

// Thêm schema này để validate bước nhập mật khẩu mới ở trang ForgotPassword
export const resetPasswordSchema = z
  .object({
    new_password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    new_password_confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["new_password_confirm"],
  });
