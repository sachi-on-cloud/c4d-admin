/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1A73E8",
          50: "#e8f1fe",
          100: "#d1e3fd",
          200: "#b3ccff",
          300: "#89b1fb",
          400: "#5b95f6",
          500: "#3b82f6",
          600: "#1A73E8",
          700: "#185ec0",
          800: "#164e9f",
          900: "#133f7f",
        },
        brand: {
          DEFAULT: "#2563eb", // blue-600
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          DEFAULT: "#22c55e", // green-500
        },
        secondary: {
          DEFAULT: "#37408C",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f8fafc", // slate-50
          muted: "#f5f5f5", // neutral-100
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
});
