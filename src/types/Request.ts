export type LoginRequest = {
  phone: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  phone_number: string;
};

export type GoogleLoginRequest = {
  id_token: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerifyResetOtpRequest = {
  email: string;
  code: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
};
