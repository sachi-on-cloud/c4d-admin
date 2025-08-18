// Centralized color tokens for JS (configs, charts, inline styles)
// Read current theme colors from CSS variables so runtime theme switching applies.

function cssVarRGB(name, fallback = "31 70 166") { // primary-600 vibrant
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function rgbToHex(rgb) {
  const [r, g, b] = rgb.split(/\s+/).map((n) => parseInt(n, 10));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getThemeColors() {
  const p600 = cssVarRGB("--color-primary-600");
  const p300 = cssVarRGB("--color-primary-300");
  const p900 = cssVarRGB("--color-primary-900");
  const surface = cssVarRGB("--color-surface", "255 255 255");

  return {
    primary: rgbToHex(p600),
    primaryLight: rgbToHex(p300),
    primary900: rgbToHex(p900),
    secondary: "#37408C",
    success: "#16A34A",
    info: "#0EA5E9",
    danger: "#DC2626",
    white: rgbToHex(surface),
    surfaceMuted: "#f5f5f5",
    surfaceHeader: "#f2f2f2",
    textMuted: "#37474f",
    gridBorder: "#dddddd",
    mapFill: "#82CFFD",
    mapStroke: "#0077BE",
  };
}

export default getThemeColors;
