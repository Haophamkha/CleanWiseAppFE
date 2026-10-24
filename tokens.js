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

const light = {
  colors: {
    primary: { ...p.primary, fill: p.primary.DEFAULT, fillDark: p.primary.dark },
    accent: { DEFAULT: "#F59E0B", light: "#FEF3C7", dark: "#B45309" },
    canvas: "#F5F7FA",
    surface: "#FFFFFF",
    surfaceMuted: "#F3F4F6",
    violet: { DEFAULT: "#7C3AED", light: "#EDE9FE" },
    line: "#E5E7EB",
    ink: { DEFAULT: "#111827", soft: "#4B5563", muted: "#9CA3AF" },
    success: { DEFAULT: "#16A34A", light: "#DCFCE7" },
    danger: { DEFAULT: "#DC2626", light: "#FEE2E2" },
    info: { DEFAULT: "#2563EB", light: "#DBEAFE", dark: "#1E40AF" },
  },
  gradients: { hero: p.gradient },
};

for (const family of ["success", "danger", "info", "accent"]) light.colors[family].fill = light.colors[family].DEFAULT;

const dark = {
  colors: {
    primary: { DEFAULT: "#5EEAD4", dark: "#99F6E4", fill: "#0F766E", fillDark: "#115E59", light: "#203635", soft: "#192B2C", border: "#345451" },
    accent: { DEFAULT: "#FBBF24", fill: "#92400E", light: "#362F23", dark: "#FDE68A" },
    canvas: "#111318",
    surface: "#1B1F27",
    surfaceMuted: "#252B35",
    line: "#2C333D",
    ink: { DEFAULT: "#F1F5F9", soft: "#B8C0CC", muted: "#929EAF" },
    success: { DEFAULT: "#86EFAC", fill: "#166534", light: "#23362E" },
    danger: { DEFAULT: "#FCA5A5", fill: "#B91C1C", light: "#38282D" },
    info: { DEFAULT: "#93C5FD", fill: "#1D4ED8", light: "#243145", dark: "#BFDBFE" },
    violet: { DEFAULT: "#C4B5FD", light: "#302D40" },
  },
  gradients: { hero: ["#182B2D", "#171F27", "#111318"] },
};

function colorVariables(colors, prefix = "--cw") {
  const result = {};
  for (const [key, value] of Object.entries(colors)) {
    const name = key === "DEFAULT" ? prefix : `${prefix}-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
    if (typeof value === "object") Object.assign(result, colorVariables(value, name));
    else {
      const hex = value.replace("#", "");
      result[name] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16)).join(" ");
    }
  }
  return result;
}
function variableColors(colors, prefix = "--cw") {
  return Object.fromEntries(Object.entries(colors).map(([key, value]) => {
    const name = key === "DEFAULT" ? prefix : `${prefix}-${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)}`;
    return [key === "DEFAULT" ? "DEFAULT" : key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`), typeof value === "object" ? variableColors(value, name) : `rgb(var(${name}) / <alpha-value>)`];
  }));
}
module.exports = {
  ...light,
  themes: { light, dark },
  variables: { light: colorVariables(light.colors), dark: colorVariables(dark.colors) },
  tailwindColors: variableColors(light.colors),
};
