import type { User } from "./User";

export type UserResponse = Partial<User>;

export type AuthResponse = {
  access: string;
  refresh: string;
  user: UserResponse;
  is_new_user?: boolean;
};

export type CustomerProfileResponse = User;
