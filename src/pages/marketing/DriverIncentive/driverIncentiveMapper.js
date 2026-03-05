const toDisplay = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const toObjectDisplay = (value, fallback = "-") => {
  if (!value || typeof value !== "object") return fallback;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return fallback;
  }
};

export const mapDriverIncentiveRows = (rows = []) =>
  rows.map((row, index) => {
    const componentData =
      row?.component && typeof row.component === "object"
        ? row.component
        : Array.isArray(row?.components)
          ? row.components[0] || {}
          : Array.isArray(row?.config?.components)
            ? row.config.components[0] || {}
            : {};

    const scopeData =
      row?.scope && typeof row.scope === "object"
        ? row.scope
        : row?.config?.scope && typeof row.config.scope === "object"
          ? row.config.scope
          : {};

    return {
      settingIdValue: Number(row?.settingId || row?.SettingId || row?.id || 0),
      id: String(row?.settingId || row?.id || `driver-incentive-${index + 1}`),
      settingId: toDisplay(row?.settingId, "-"),
      name: toDisplay(row?.name, "-"),
      description: toDisplay(row?.description, "-"),
      isActive: toDisplay(row?.isActive, "-"),
      code: toDisplay(row?.code || componentData?.code, "-"),
      componentEnabled: toDisplay(
        componentData?.enabled,
        "-"
      ),
      validFrom: toDisplay(
        componentData?.validFrom,
        "-"
      ),
      validTo: toDisplay(
        componentData?.validTo,
        "-"
      ),
      payoutFrequency: toDisplay(
        componentData?.payoutFrequency,
        "-"
      ),
      payoutByTier: toObjectDisplay(
        componentData?.payoutByTier,
        "-"
      ),
      partnerType: toDisplay(row?.partnerType || scopeData?.partnerType, "-"),
      vehicleType: toDisplay(row?.vehicleType || scopeData?.vehicleType, "-"),
      zone: toDisplay(row?.zone || scopeData?.zone, "-"),
      scope: toObjectDisplay(scopeData, "-"),
      component: toObjectDisplay(componentData, "-"),
      raw: row,
    };
  });
