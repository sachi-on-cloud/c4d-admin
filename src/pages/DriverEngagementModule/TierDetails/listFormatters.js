export const EXPAND_ICON_PATH = "/img/expand.png";

export const TIER_BADGE_CLASS = {
  SILVER: "bg-blue-gray-100 text-blue-gray-700",
  GOLD: "bg-amber-100 text-amber-800",
  ELITE: "bg-emerald-100 text-emerald-800",
};

export const getTierDisplay = (row) => {
  if (row.type !== "TIER_RULES") return "-";
  const tiers = row?.raw?.config?.tiers;
  if (!tiers || typeof tiers !== "object") return "-";
  const keys = Object.keys(tiers).filter(Boolean);
  return keys.length ? keys.join(", ") : "-";
};

export const getTierList = (row) => {
  if (row.type !== "TIER_RULES") return [];
  const tiers = row?.raw?.config?.tiers;
  if (!tiers || typeof tiers !== "object") return [];
  return Object.keys(tiers).filter(Boolean);
};

export const formatTypeLabel = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  const lower = text.toLowerCase();
  const words = lower.split("_").filter(Boolean);
  if (!words.length) return "-";
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export const formatLabelCase = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const safeText = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

export const formatPeriodLabel = (value) => {
  const normalized = safeText(value, "").toUpperCase();
  if (normalized === "WEEKLY") return "Weekly";
  if (normalized === "DAILY" || normalized === "DALIY") return "Daliy";
  return safeText(value, "-");
};

export const formatMetricLabel = (value) => {
  const normalized = safeText(value, "");
  if (normalized === "onlineHours") return "Online Hours";
  if (normalized === "tripCount") return "Trip Count";
  if (normalized === "acceptancePct") return "Acceptance Pct";
  if (normalized === "rating") return "Rating";
  return safeText(value, "-");
};

export const formatServiceTypeLabel = (value) => {
  const normalized = safeText(value, "").toUpperCase();
  if (normalized === "ANY") return "All";
  if (normalized === "RIDES") return "Local";
  if (normalized === "AUTO") return "Auto";
  if (normalized === "RENTAL_HOURLY_PACKAGE") return "Hourly Package";
  if (normalized === "RENTAL_OUTSTATION" || normalized === "RENTAL") return "Round Trip";
  if (normalized === "RENTAL_DROP_TAXI" || normalized === "DROP_TAXI" || normalized === "RENTAL_DROP_ONLY") {
    return "Drop Taxi";
  }
  return safeText(value, "-");
};

export const formatBoolLabel = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return safeText(value, "-");
};
