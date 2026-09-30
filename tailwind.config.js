const tokens = require("./tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tokens.colors,
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "26px"],
        xl: ["22px", "28px"],
        "2xl": ["28px", "34px"],
        "3xl": ["34px", "40px"],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px", xl: "24px" },
    },
  },
  plugins: [],
};
