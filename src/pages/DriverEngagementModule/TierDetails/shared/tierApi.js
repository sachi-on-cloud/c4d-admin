const parseActiveFlag = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (["TRUE", "1", "ENABLED"].includes(normalized)) return true;
    if (["FALSE", "0", "DISABLED"].includes(normalized)) return false;
  }
  return null;
};

export const normalizeTierRows = (rows = []) =>
  (Array.isArray(rows) ? rows : []).map((row, index) => {
    const id = row?.id || row?._id || row?.tierId || String(index + 1);
    const activeFromIsActive = parseActiveFlag(row?.isActive);
    const activeFromStatus = parseActiveFlag(row?.status);
    // Be conservative for validation: unknown active state should not block new tiers.
    const isActive = activeFromIsActive || activeFromStatus || false;
    const updatedAtRaw = row?.updatedAt || row?.updatedDate || row?.createdAt || "";
    const scope =
      row?.config?.scope && typeof row.config.scope === "object"
        ? row.config.scope
        : row?.scope && typeof row.scope === "object"
          ? row.scope
          : {};
    const zone = String(scope?.zone || row?.zone || "ALL")

    return {
      id: String(id),
      type: row?.type || row?.ruleType || "TIER_RULES",
      name: row?.name || "",
      description: row?.description || "",
      isActive,
      zone,
      updatedAt: updatedAtRaw ? String(updatedAtRaw).slice(0, 10) : "-",
      raw: row,
    };
  });
