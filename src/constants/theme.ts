const tokens = require("../../tokens");

const c = tokens.colors;
export const CHAT_BG = "#E9EEF1";

export const COLORS = {
  primary: c.primary.DEFAULT as string,
  primaryDark: c.primary.dark as string,
  primaryLight: c.primary.light as string,
  primarySoft: c.primary.soft as string,
  primaryBorder: c.primary.border as string,
  accent: c.accent.DEFAULT as string,
  accentLight: c.accent.light as string,
  accentDark: c.accent.dark as string,
  canvas: c.canvas as string,
  surface: c.surface as string,
  line: c.line as string,
  ink: c.ink.DEFAULT as string,
  inkSoft: c.ink.soft as string,
  inkMuted: c.ink.muted as string,
  success: c.success.DEFAULT as string,
  successLight: c.success.light as string,
  danger: c.danger.DEFAULT as string,
  dangerLight: c.danger.light as string,
  white: "#FFFFFF",
  info: c.info.DEFAULT as string,
  infoLight: c.info.light as string,
  infoDark: c.info.dark as string,

  background: c.canvas as string,
  border: c.line as string,
  text: c.ink.DEFAULT as string,
  textSecondary: c.ink.soft as string,
  textMuted: c.ink.muted as string,
};

export const GRADIENTS = {
  hero: tokens.gradients.hero as [string, string, string],
};

// Hai mức đổ bóng dùng chung toàn app
export const SHADOWS = {
  card: {
    shadowColor: COLORS.ink,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  float: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

// Màu chữ/nền mờ đặt trên nền màu đậm (hero ví, header gradient...)
export const ON_DARK = {
  text: "#FFFFFF",
  textSoft: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.65)",
  surface: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.25)",
  spinner: "rgba(255,255,255,0.7)",
} as const;

// Nền mờ phía sau modal
export const OVERLAY = "rgba(5,20,15,0.55)";

// Bo góc dùng cho hero và bottom sheet
export const RADIUS = {
  hero: 32,
  sheet: 32,
  card: 20,
} as const;
