export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  PUSH_TOKEN: "push_token",
};

export const ROUTES = {
  LOGIN: "/(auth)/login",
  REGISTER: "/(auth)/register",
  HOME: "/(tabs)/home",
  EDIT_PROFILE: "/profile/edit",
  VOUCHERS: "/vouchers",
  WALLET: "/profile/wallets/wallet",
  FAVORITE_WORKERS: "/profile/favorite-workers",
  PAYMENT_METHODS: "/profile/payment-methods",
  BOOKING_CONFIRM: "/booking/confirm",
  ADDRESS: "/profile/address",
  SETTINGS: "/profile/settings",
  ABOUT: "/profile/about",
  CHANGE_PASSWORD: "/profile/change-password",
} as const;
