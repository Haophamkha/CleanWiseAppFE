// Nguồn màu DUY NHẤT của app. Muốn đổi màu: đổi ACTIVE.
const palettes = {
  violet: {
    primary: {
      DEFAULT: "#7C3AED",
      dark: "#6D28D9",
      light: "#EDE9FE",
      soft: "#F5F3FF",
      border: "#DDD6FE",
    },
    gradient: ["#DDD6FE", "#FBCFE8", "#FFFFFF"],
  },
  teal: {
    primary: {
      DEFAULT: "#0D9488",
      dark: "#0F766E",
      light: "#CCFBF1",
      soft: "#F0FDFA",
      border: "#99F6E4",
    },
    gradient: ["#99F6E4", "#E0F2FE", "#FFFFFF"],
  },
  emerald: {
    primary: {
      DEFAULT: "#059669",
      dark: "#047857",
      light: "#D1FAE5",
      soft: "#ECFDF5",
      border: "#A7F3D0",
    },
    gradient: ["#A7F3D0", "#ECFCCB", "#FFFFFF"],
  },
  cyan: {
    primary: {
      DEFAULT: "#0891B2",
      dark: "#0E7490",
      light: "#CFFAFE",
      soft: "#ECFEFF",
      border: "#A5F3FC",
    },
    gradient: ["#A5F3FC", "#E0E7FF", "#FFFFFF"],
  },
};

const ACTIVE = "teal"; // <-- violet | teal | emerald | cyan

const p = palettes[ACTIVE];

module.exports = {
  colors: {
    primary: p.primary,
    accent: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#B45309" },
    canvas: "#F5F7FA",
    surface: "#FFFFFF",
    line: "#E5E7EB",
    ink: { DEFAULT: "#111827", soft: "#4B5563", muted: "#9CA3AF" },
    success: { DEFAULT: "#16A34A", light: "#DCFCE7" },
    danger: { DEFAULT: "#DC2626", light: "#FEE2E2" },
    info: { DEFAULT: "#2563EB", light: "#DBEAFE", dark: "#1E40AF" },
  },
  gradients: { hero: p.gradient },
};
